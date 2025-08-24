import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterRequest,
} from '../models/auth';
import { ChangePasswordRequest } from '../models/change-password-request';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8088/api/v1/auth';

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  authenticate(
    data: AuthenticationRequest
  ): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.baseUrl}/authenticate`,
      data
    );
  }

  activateAccount(token: string): Observable<void> {
    return this.http.get<void>(
      `${this.baseUrl}/activate-account?token=${token}`
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/change-password`, request, {
      responseType: 'text' as 'json',
    });
  }
}
