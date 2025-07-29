import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AudioAnalysisRequestDto {
  timestamp: string;
  speaker: string;
  text: string;
  sentiment: {
    text: string;
    voice: string;
    score: number;
  };
  voiceFeatures: {
    pitch: number;
    energy: number;
    rate: number;
  };
  sessionId: string;
  analysisType: string;
  emotionAnalysis?: {
    primary_emotion: string;
    confidence: number;
    reasoning: string[];
    voice_intensity: number;
    escalation_level: number;
  };
  audioStats?: {
    chunks_processed: number;
    chunks_with_speech: number;
    total_audio_duration: number;
    speech_duration: number;
    avg_volume: number;
    peak_volume: number;
  };
  callRecordId?: number; // Optional - link to specific call record
}

export interface AudioAnalysisResponseDto {
  id: number;
  timestamp: string;
  speaker: string;
  text: string;
  sentiment: {
    text: string;
    voice: string;
    score: number;
  };
  voiceFeatures: {
    pitch: number;
    energy: number;
    rate: number;
  };
  sessionId: string;
  analysisType: string;
  emotionAnalysis?: {
    primary_emotion: string;
    confidence: number;
    reasoning: string[];
    voice_intensity: number;
    escalation_level: number;
  };
  callRecordId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AudioAnalysisService {
  private readonly baseUrl = 'http://localhost:8088/api/v1/audio-analysis';

  constructor(private http: HttpClient) {}

  /**
   * Store audio analysis result in Spring Boot backend
   */
  saveAnalysisResult(
    analysisData: AudioAnalysisRequestDto
  ): Observable<AudioAnalysisResponseDto> {
    console.log(
      '💾 Saving analysis result to Spring Boot:',
      analysisData.text.substring(0, 50) + '...'
    );

    return this.http.post<AudioAnalysisResponseDto>(
      `${this.baseUrl}/save`,
      analysisData
    );
  }

  /**
   * Get all analysis results for a session
   */
  getSessionResults(sessionId: string): Observable<AudioAnalysisResponseDto[]> {
    return this.http.get<AudioAnalysisResponseDto[]>(
      `${this.baseUrl}/session/${sessionId}`
    );
  }

  /**
   * Get analysis results for a specific call record
   */
  getCallRecordResults(
    callRecordId: number
  ): Observable<AudioAnalysisResponseDto[]> {
    return this.http.get<AudioAnalysisResponseDto[]>(
      `${this.baseUrl}/call-record/${callRecordId}`
    );
  }

  /**
   * Get analysis result by ID
   */
  getAnalysisResult(id: number): Observable<AudioAnalysisResponseDto> {
    return this.http.get<AudioAnalysisResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Delete analysis result
   */
  deleteAnalysisResult(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get analysis statistics for a session
   */
  getSessionStatistics(sessionId: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/session/${sessionId}/statistics`
    );
  }
}
