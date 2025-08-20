import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostCallAnalysisResult {
  score: number;
  feedback: string;
  complaintType: string;
  summary: string;
}

export interface PostCallReportResult {
  duration?: string;
  totalSentiment?: number;
  outcome?: string;
  averageSentiment?: number;
  escalationLevel?: number;
  performanceScore?: number;
  analysisResult?: PostCallAnalysisResult;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class PostCallService {
  private baseUrl = 'http://localhost:8088/api/v1';

  constructor(private http: HttpClient) {}

  analyzeTranscriptScore(callRecordId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/postCall/score/${callRecordId}`);
  }

  generateTranscriptReport(callRecordId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/postCall/report/${callRecordId}`
    );
  }

  sendFollowUpEmail(callRecordId: number, emailContent: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/postCall/email/${callRecordId}`,
      emailContent
    );
  }

  updateDailyStats(
    recordId: number,
    email: string,
    score: number,
    averageSentiment: number
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/dailystats/update/${recordId}?email=${encodeURIComponent(
        email
      )}&score=${score}&averageSentiment=${averageSentiment}`,
      {}
    );
  }

  savePerformancePostCall(
    complaintType: string,
    feedback: string,
    score: number,
    callId: number,
    summary: string
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/performances/save?complaintType=${encodeURIComponent(
        complaintType
      )}&feedback=${encodeURIComponent(
        feedback
      )}&score=${score}&callId=${callId}&summary=${encodeURIComponent(
        summary
      )}`,
      {}
    );
  }

  getAverageSentiment(callId: number): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/Sentiment/callSentiment/${callId}`
    );
  }

  updateOutcomePostCall(callId: number, outcome: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/callrecord/${callId}/outcome`,
      outcome,
      { responseType: 'text' }
    );
  }
}
