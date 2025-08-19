import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:8088/api/v1/user';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getAll`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getById`, {
      params: { id: id.toString() },
    });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getByEmail`, {
      params: { email: email },
    });
  }

  addEmployee(
    email: string,
    firstName: string,
    lastName: string,
    role: number
  ): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/save`, null, {
      params: {
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: role.toString(),
      },
    });
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/update`, user);
  }

  deleteUserById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  getOnlineAgents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getOnlineAgents`);
  }

  agentIsOnline(email: string): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/agentIsOnline`, {
      params: { email: email },
    });
  }

  agentIsOffline(email: string): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/agentIsOffline`, {
      params: { email: email },
    });
  }

  assignTeamToUser(userId: number, teamId: number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/assign-team`, null, {
      params: {
        userId: userId.toString(),
        teamId: teamId.toString(),
      },
    });
  }
}
