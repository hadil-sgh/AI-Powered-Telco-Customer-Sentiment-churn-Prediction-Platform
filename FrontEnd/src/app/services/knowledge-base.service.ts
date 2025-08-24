import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  KnowledgeBase,
  KnowledgeBaseCreate,
  KnowledgeBaseUpdate,
  KnowledgeBaseFilter,
  KnowledgeStatus,
  PageResponse,
} from '../models/knowledge-base';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeBaseService {
  private apiUrl = 'http://localhost:8088/api/v1/knowledge';

  constructor(private http: HttpClient) {}

  getAllKnowledgeBases(
    filter: KnowledgeBaseFilter = {},
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Observable<PageResponse<KnowledgeBase>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.category) {
      params = params.set('category', filter.category);
    }
    if (filter.priority) {
      params = params.set('priority', filter.priority);
    }
    if (filter.search) {
      params = params.set('search', filter.search);
    }

    return this.http.get<PageResponse<KnowledgeBase>>(this.apiUrl, { params });
  }

  getKnowledgeBaseById(id: number): Observable<KnowledgeBase> {
    return this.http.get<KnowledgeBase>(`${this.apiUrl}/${id}`);
  }

  createKnowledgeBase(
    knowledgeBase: KnowledgeBaseCreate
  ): Observable<KnowledgeBase> {
    return this.http.post<KnowledgeBase>(this.apiUrl, knowledgeBase);
  }

  updateKnowledgeBase(
    id: number,
    knowledgeBase: KnowledgeBaseUpdate
  ): Observable<KnowledgeBase> {
    return this.http.put<KnowledgeBase>(`${this.apiUrl}/${id}`, knowledgeBase);
  }

  deleteKnowledgeBase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, status: KnowledgeStatus): Observable<KnowledgeBase> {
    console.log('Service: Updating status for ID', id, 'to', status);
    const params = new HttpParams().set('status', status);
    return this.http.patch<KnowledgeBase>(`${this.apiUrl}/${id}/status`, null, {
      params,
    });
  }

  getAllCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getKnowledgeBasesByAuthor(
    authorId: number,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<KnowledgeBase>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<KnowledgeBase>>(
      `${this.apiUrl}/author/${authorId}`,
      { params }
    );
  }

  getMostViewedKnowledgeBases(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<KnowledgeBase>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<KnowledgeBase>>(
      `${this.apiUrl}/most-viewed`,
      { params }
    );
  }
}
