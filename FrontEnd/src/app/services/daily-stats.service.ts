import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyStats } from '../models/daily-stats';
import { AgentRankingDTO } from '../models/agent-ranking-dto';

@Injectable({
  providedIn: 'root',
})
export class DailyStatsService {
  private baseUrl = 'http://localhost:8088/api/v1/dailystats';

  constructor(private http: HttpClient) {}

  getDailyStatsByAgent(userEmail: string): Observable<DailyStats[]> {
    return this.http.get<DailyStats[]>(
      `${this.baseUrl}/getDailyStatusByAgent`,
      {
        params: { userEmail: userEmail },
      }
    );
  }

  getWeeklyStatsByAgent(email: string): Observable<DailyStats[]> {
    return this.http.get<DailyStats[]>(`${this.baseUrl}/week/${email}`);
  }

  getTeamRanking(userEmail: string): Observable<AgentRankingDTO[]> {
    return this.http.get<AgentRankingDTO[]>(`${this.baseUrl}/getTeamRanking`, {
      params: { userEmail: userEmail },
    });
  }

  getYesterdayStats(email: string): Observable<DailyStats> {
    return this.http.get<DailyStats>(`${this.baseUrl}/yesterday/${email}`);
  }
}
