import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { User } from '../models/user';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:8088/api/v1/user';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

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

  updateUser(newEmail: string, phone: number, dateOfBirth: string): Observable<User> {
    const currentEmail = this.tokenService.getEmailFromToken();
    return this.http.put<User>(`${this.baseUrl}/update`, null, {
      params: {
        currentEmail: currentEmail,
        newEmail: newEmail,
        phone: phone.toString(),
        dateOfBirth: dateOfBirth
      }
    });
  }

  // Admin method for updating user details
  // TODO: Implement proper admin endpoint in backend that supports updating firstname/lastname
  updateUserAdmin(user: User): Observable<User> {
    // Temporarily return an error since the current backend endpoint 
    // doesn't support updating firstname/lastname fields
    return throwError(() => ({
      error: {
        message: 'Admin user update not yet implemented. Please create a proper admin endpoint in the backend that supports updating firstname and lastname fields.'
      }
    }));
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
