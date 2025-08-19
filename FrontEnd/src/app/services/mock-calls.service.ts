import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MockCall } from '../models/mock-call';

@Injectable({
  providedIn: 'root',
})
export class MockCallsService {
  private baseUrl = 'http://localhost:8088/api/v1/mockCalls';

  constructor(private http: HttpClient) {}

  getMockCalls(): Observable<MockCall[]> {
    return this.http.get<MockCall[]>(`${this.baseUrl}/getAll`);
  }
}
