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

  /**
   * Save a call record with agent email, customer ID, session ID, and duration
   */
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

  /**
   * Get all call records for an agent
   */
  getCallRecordsByAgent(agentId: number): Observable<CallRecord[]> {
    return this.http.get<CallRecord[]>(`${this.baseUrl}/agent/${agentId}`);
  }

  /**
   * Get all call records for a customer
   */
  getCallRecordsByCustomer(customerId: number): Observable<CallRecord[]> {
    return this.http.get<CallRecord[]>(
      `${this.baseUrl}/customer/${customerId}`
    );
  }

  /**
   * Get a specific call record by ID
   */
  getCallRecordById(id: number): Observable<CallRecord> {
    return this.http.get<CallRecord>(`${this.baseUrl}/${id}`);
  }
}
