import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SentimentPoint } from '../models/SentimentPoint';

@Injectable({
  providedIn: 'root',
})
export class SentimentPointService {
  private baseUrl = 'http://localhost:8088/api/v1/Sentiment';

  constructor(private http: HttpClient) {}

  getSentimentPointsByUser(userEmail: string): Observable<SentimentPoint[]> {
    const url = `${this.baseUrl}/getSentimentPointsByUser?userEmail=${userEmail}`;
    return this.http.get<SentimentPoint[]>(url);
  }
}
