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
  // Add specific fields based on your backend response
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
  private baseUrl = 'http://localhost:8088/api/v1'; // Backend API base URL

  constructor(private http: HttpClient) {}

  /**
   * Analyze transcript score for a specific call record
   * @param callRecordId The ID of the call record to analyze
   * @returns Observable containing the analysis result
   */
  analyzeTranscriptScore(callRecordId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/postCall/score/${callRecordId}`);
  }

  /**
   * Generate comprehensive transcript report for a specific call record
   * @param callRecordId The ID of the call record to generate report for
   * @returns Observable containing the report data
   */
  generateTranscriptReport(callRecordId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/postCall/report/${callRecordId}`
    );
  }

  /**
   * Update call outcome
   * @param callRecordId The ID of the call record
   * @param outcome The new outcome value
   * @returns Observable containing the updated record
   */
  updateCallOutcome(callRecordId: number, outcome: string): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/call-records/${callRecordId}/outcome`,
      {
        outcome: outcome,
      }
    );
  }

  /**
   * Send follow-up email to customer
   * @param callRecordId The ID of the call record
   * @param emailContent Email content and details
   * @returns Observable containing the email sending result
   */
  sendFollowUpEmail(callRecordId: number, emailContent: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/postCall/email/${callRecordId}`,
      emailContent
    );
  }
}
