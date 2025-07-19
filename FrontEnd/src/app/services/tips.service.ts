import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CoachingTip, TipType } from '../models/coaching-tip';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipsService {
private apiUrl = 'http://localhost:8088/api/v1/coaching-tips'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(this.apiUrl);
  }

  getById(id: number): Observable<CoachingTip> {
    return this.http.get<CoachingTip>(`${this.apiUrl}/${id}`);
  }

  create(tip: CoachingTip): Observable<CoachingTip> {
    return this.http.post<CoachingTip>(this.apiUrl, tip);
  }

  update(tip: CoachingTip): Observable<CoachingTip> {
    return this.http.put<CoachingTip>(this.apiUrl, tip);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignTip(tip: CoachingTip, userId: number, managerId: number): Observable<CoachingTip> {
    return this.http.post<CoachingTip>(`${this.apiUrl}/assign?userId=${userId}&managerId=${managerId}`, tip);
  }

  createAndAssign(title: string, message: string, type: TipType, userId: number, managerId: number): Observable<CoachingTip> {
    const params = `?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}&type=${type}&userId=${userId}&managerId=${managerId}`;
    return this.http.post<CoachingTip>(`${this.apiUrl}/create-and-assign${params}`, {});
  }

  markAsAcknowledged(tipId: number): Observable<CoachingTip> {
    return this.http.put<CoachingTip>(`${this.apiUrl}/${tipId}/acknowledge`, {});
  }

  markAsHelpful(tipId: number, helpful: boolean): Observable<CoachingTip> {
    return this.http.put<CoachingTip>(`${this.apiUrl}/${tipId}/helpful?helpful=${helpful}`, {});
  }

  markAsShown(tipId: number): Observable<CoachingTip> {
    return this.http.put<CoachingTip>(`${this.apiUrl}/${tipId}/shown`, {});
  }

  getUnacknowledgedByUser(userId: number): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(`${this.apiUrl}/user/${userId}/unacknowledged`);
  }

  getRecentByUser(userId: number, days: number = 7): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(`${this.apiUrl}/user/${userId}/recent?days=${days}`);
  }

   getTipsByUserId(userId: number): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(`${this.apiUrl}/getTipsByUserId/${userId}`);
  }
  getTipsByUserEmail(email: string): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(`${this.apiUrl}/getTipsByUserEmail/${encodeURIComponent(email)}`);
  }

  // GET /user/email/{email}/unacknowledged
  getUnacknowledgedByUserEmail(email: string): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(`${this.apiUrl}/user/email/${encodeURIComponent(email)}/unacknowledged`);
  }

  // GET /user/email/{email}/recent?days=7
  getRecentByUserEmail(email: string, days: number = 7): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(`${this.apiUrl}/user/email/${encodeURIComponent(email)}/recent?days=${days}`);
  }
}

