import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Complaint, ComplaintStats } from '../models/complaint';

@Injectable({
  providedIn: 'root',
})
export class ComplaintService {
  private baseUrl = 'http://localhost:8088/api/v1/complaints';

  // Complaint types for Ooredoo Telecom
  public readonly COMPLAINT_TYPES = [
    'Network Connectivity',
    'Internet Speed / Data Issues',
    'Billing & Charges',
    'Recharge or Balance Problems',
    'SIM or Number Portability',
    'Service Activation/Deactivation',
    'Customer Support Experience',
    'Account Login / App Issues',
    'Value-Added Services',
    'Other',
  ];

  constructor(private http: HttpClient) {}

  getAllComplaints(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(this.baseUrl);
  }

  getComplaintStats(): Observable<ComplaintStats[]> {
    return this.getAllComplaints().pipe(
      map((complaints) => this.calculateComplaintStats(complaints))
    );
  }

  private calculateComplaintStats(complaints: Complaint[]): ComplaintStats[] {
    const totalComplaints = complaints.length;
    const stats: ComplaintStats[] = [];

    this.COMPLAINT_TYPES.forEach((type) => {
      const count = complaints.filter(
        (complaint) => complaint.complaintType === type
      ).length;
      const percentage =
        totalComplaints > 0 ? (count / totalComplaints) * 100 : 0;

      stats.push({
        type: type,
        count: count,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      });
    });

    return stats.sort((a, b) => b.count - a.count); // Sort by count descending
  }
}
