import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyStats } from '../models/daily-stats';
import { AgentRankingDTO } from '../models/agent-ranking-dto';
import { TeamStatsDTO } from '../models/TeamStatsDTO';
import { WeeklyTeamStatsDTO } from '../models/WeeklyTeamStatsDTO';

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

  getTeamStatsForToday(teamId: number): Observable<TeamStatsDTO> {
    return this.http.get<TeamStatsDTO>(`${this.baseUrl}/team/${teamId}/today-stats`);
  }

  getTeamWeeklyStats(teamId: number): Observable<WeeklyTeamStatsDTO[]> {
    return this.http.get<WeeklyTeamStatsDTO[]>(`${this.baseUrl}/team/${teamId}/week-stats`);
  }
}
