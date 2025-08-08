import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private jwtHelper: JwtHelperService) {}
  getUserIdFromToken(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = this.jwtHelper.decodeToken(token);
      return decodedToken.sub;
    }
    return '';
  }

  getFullNameFromToken(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = this.jwtHelper.decodeToken(token);
      return decodedToken.fullName || '';
    }
    return '';
  }

  getUserAuthorities(): string[] {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = this.jwtHelper.decodeToken(token);
      return decodedToken.authorities || [];
    }
    return [];
  }

  getEmailFromToken(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = this.jwtHelper.decodeToken(token);
      return decodedToken.email || decodedToken.sub || '';
    }
    return '';
  }
}
