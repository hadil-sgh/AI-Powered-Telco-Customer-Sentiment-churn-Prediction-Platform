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

  updateCallOutcome(callRecordId: number, outcome: string): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/call-records/${callRecordId}/outcome`,
      {
        outcome: outcome,
      }
    );
  }


  sendFollowUpEmail(callRecordId: number, emailContent: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/postCall/email/${callRecordId}`,
      emailContent
    );
  }
}
