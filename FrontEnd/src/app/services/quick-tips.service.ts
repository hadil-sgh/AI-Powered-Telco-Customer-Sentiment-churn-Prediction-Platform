import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoachingTip, TipType } from '../models/coaching-tip';

@Injectable({
  providedIn: 'root',
})
export class QuickTipsService {
  private baseUrl = 'http://localhost:8088/api/v1/coaching-tips';

  constructor(private http: HttpClient) {}

  // Create a new coaching tip
  createCoachingTip(coachingTip: CoachingTip): Observable<CoachingTip> {
    return this.http.post<CoachingTip>(`${this.baseUrl}/create`, coachingTip);
  }

  // Get all coaching tips
  getAllCoachingTips(): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(`${this.baseUrl}`);
  }

  // Get coaching tip by ID
  getCoachingTipById(id: number): Observable<CoachingTip> {
    return this.http.get<CoachingTip>(`${this.baseUrl}/getOne/${id}`);
  }

  // Update coaching tip
  updateCoachingTip(coachingTip: CoachingTip): Observable<CoachingTip> {
    return this.http.put<CoachingTip>(`${this.baseUrl}/update`, coachingTip);
  }

  // Delete coaching tip
  deleteCoachingTip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  // Assign existing tip to user
  assignTip(
    tip: CoachingTip,
    userId: number,
    managerId: number
  ): Observable<CoachingTip> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('managerId', managerId.toString());
    return this.http.post<CoachingTip>(`${this.baseUrl}/assign`, tip, {
      params,
    });
  }

  // Create and assign tip to user
  createAndAssignTip(
    title: string,
    message: string,
    type: TipType,
    userId: number,
    managerId: number
  ): Observable<CoachingTip> {
    const params = new HttpParams()
      .set('title', title)
      .set('message', message)
      .set('type', type)
      .set('userId', userId.toString())
      .set('managerId', managerId.toString());
    return this.http.post<CoachingTip>(
      `${this.baseUrl}/create-and-assign`,
      null,
      { params }
    );
  }

  // Acknowledge tip
  acknowledgeTip(tipId: number): Observable<CoachingTip> {
    return this.http.put<CoachingTip>(
      `${this.baseUrl}/${tipId}/acknowledge`,
      null
    );
  }

  // Mark tip as helpful
  markTipAsHelpful(tipId: number, helpful: boolean): Observable<CoachingTip> {
    const params = new HttpParams().set('helpful', helpful.toString());
    return this.http.put<CoachingTip>(
      `${this.baseUrl}/${tipId}/helpful`,
      null,
      { params }
    );
  }

  // Mark tip as shown
  markTipAsShown(tipId: number): Observable<CoachingTip> {
    return this.http.put<CoachingTip>(`${this.baseUrl}/${tipId}/shown`, null);
  }

  // Get unacknowledged tips by user ID
  getUnacknowledgedTipsByUserId(userId: number): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(
      `${this.baseUrl}/user/${userId}/unacknowledged`
    );
  }

  // Get recent tips by user ID
  getRecentTipsByUserId(
    userId: number,
    days: number = 7
  ): Observable<CoachingTip[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<CoachingTip[]>(
      `${this.baseUrl}/user/${userId}/recent`,
      { params }
    );
  }

  // Get tips by user ID
  getTipsByUserId(userId: number): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(
      `${this.baseUrl}/getTipsByUserId/${userId}`
    );
  }

  // Get tips by user email
  getTipsByUserEmail(email: string): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(
      `${this.baseUrl}/getTipsByUserEmail/${email}`
    );
  }

  // Get unacknowledged tips by user email
  getUnacknowledgedTipsByUserEmail(email: string): Observable<CoachingTip[]> {
    return this.http.get<CoachingTip[]>(
      `${this.baseUrl}/user/email/${email}/unacknowledged`
    );
  }

  // Get recent tips by user email
  getRecentTipsByUserEmail(
    email: string,
    days: number = 7
  ): Observable<CoachingTip[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<CoachingTip[]>(
      `${this.baseUrl}/user/email/${email}/recent`,
      { params }
    );
  }
}
