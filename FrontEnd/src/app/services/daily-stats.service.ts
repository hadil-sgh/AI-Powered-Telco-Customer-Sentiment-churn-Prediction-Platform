import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyStats } from '../models/daily-stats';

@Injectable({
  providedIn: 'root'
})
export class DailyStatsService {
  private baseUrl = 'http://localhost:8088/api/v1/dailystats';

  constructor(private http: HttpClient) { }

  getDailyStatsByAgent(userEmail: string): Observable<DailyStats[]> {
    const url = `${this.baseUrl}/getDailyStatusByAgent?userEmail=${userEmail}`;
    return this.http.get<DailyStats[]>(url);
  }
}