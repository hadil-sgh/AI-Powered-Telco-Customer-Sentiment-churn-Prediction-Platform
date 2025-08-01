import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChurnPrediction } from '../models/churn-prediction';

@Injectable({
  providedIn: 'root'
})
export class ChurnPredictionService {
  
private baseUrl = 'http://localhost:8088/api/v1/churn';

  constructor(private http: HttpClient) {}

  getChurnPrediction(customerId: number): Observable<ChurnPrediction> {
    return this.http.post<ChurnPrediction>(`${this.baseUrl}/predict/${customerId}`, {});
  }

}
