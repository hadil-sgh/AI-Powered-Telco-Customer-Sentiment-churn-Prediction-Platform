import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CallRecord } from '../models/call-record';

@Injectable({
  providedIn: 'root',
})
export class CallRecordService {
  private baseUrl = 'http://localhost:8088/api/v1/callrecord';

  constructor(private http: HttpClient) {}

  getAverageCallDuration(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/calls/average-duration`);
  }
  deleteCallRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  saveCallRecord(
    email: string,
    customerId: number,
    sessionId: string,
    duration: number
  ): Observable<CallRecord> {
    const params = new HttpParams()
      .set('email', email)
      .set('customerId', customerId.toString())
      .set('sessionId', sessionId)
      .set('duration', duration.toString());

    return this.http.post<CallRecord>(`${this.baseUrl}/save`, null, { params });
  }

  getCallRecordsByAgent(agentId: number): Observable<CallRecord[]> {
    return this.http.get<CallRecord[]>(`${this.baseUrl}/agent/${agentId}`);
  }

  getCallRecordsByCustomer(customerId: number): Observable<CallRecord[]> {
    return this.http.get<CallRecord[]>(
      `${this.baseUrl}/customer/${customerId}`
    );
  }

  getCallRecordById(id: number): Observable<CallRecord> {
    return this.http.get<CallRecord>(`${this.baseUrl}/${id}`);
  }

  getCallRecordBySession(email: string): Observable<CallRecord[]> {
    return this.http.get<CallRecord[]>(`${this.baseUrl}/getbysession/${email}`);
  }
}
