import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { FeedPageResponse } from './feed.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private readonly API_BASE = `${environment.apiUrl}/api/feed`;

  isLoading = signal<boolean>(false);
  isSyncing = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getFeed(page: number = 0, size: number = 15, developer?: string): Observable<FeedPageResponse> {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (developer && developer !== 'all') {
      params = params.set('developer', developer);
    }

    return this.http.get<FeedPageResponse>(this.API_BASE, { params }).pipe(
      tap({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false)
      })
    );
  }

  syncFeed(): Observable<{ success: boolean; newCommits: number; message: string }> {
    this.isSyncing.set(true);
    return this.http.post<{ success: boolean; newCommits: number; message: string }>(`${this.API_BASE}/sync`, {}).pipe(
      tap({
        next: () => this.isSyncing.set(false),
        error: () => this.isSyncing.set(false)
      })
    );
  }

  toggleReaction(sha: string, reactionType: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/${sha}/reaction`, { reactionType });
  }
}
