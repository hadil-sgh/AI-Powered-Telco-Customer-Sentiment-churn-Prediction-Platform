import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Performance } from '../models/performance';

@Injectable({
  providedIn: 'root'
})
export class PerformancesService {
  private baseUrl = 'http://localhost:8088/api/v1/performances';

  constructor(private http: HttpClient) { }

  getAllPerformancesByAgent(email: string): Observable<Performance[]> {
    const url = `${this.baseUrl}/getAllByAgent?email=${email}`;
    return this.http.get<Performance[]>(url);
  }
}
