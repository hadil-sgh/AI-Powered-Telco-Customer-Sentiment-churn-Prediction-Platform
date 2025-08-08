import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../models/note';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private baseUrl = 'http://localhost:8088/api/v1/notes';

  constructor(private http: HttpClient) {}

  /**
   * Create a new note
   */
  createNote(callId: number, description: string): Observable<Note> {
    const params = new HttpParams()
      .set('callId', callId.toString())
      .set('description', description);
    return this.http.post<Note>(`${this.baseUrl}/save`, null, { params });
  }

  /**
   * Update a note
   */
  updateNote(callId: number, description: string): Observable<Note> {
    const params = new HttpParams()
      .set('callId', callId.toString())
      .set('description', description);
    return this.http.put<Note>(`${this.baseUrl}/update`, null, { params });
  }

  /**
   * Delete a note
   */
  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get notes by customer (using call ID)
   */
  getNotesByCustomer(callId: number): Observable<Note[]> {
    const params = new HttpParams().set('callId', callId.toString());
    return this.http.get<Note[]>(`${this.baseUrl}/getALLbyCustomer`, {
      params,
    });
  }

  /**
   * Get notes by agent email (session-based)
   */
  getNotesByAgent(email: string): Observable<Note[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Note[]>(`${this.baseUrl}/getALLbyAgent`, { params });
  }
}
