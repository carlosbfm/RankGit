import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DeveloperDetails, LeaderboardResponse, RankingFilterParams } from './ranking.model';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private readonly API_BASE = 'http://localhost:8080/api/rankings';

  leaderboardData = signal<LeaderboardResponse | null>(null);
  isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  fetchLeaderboard(filter: RankingFilterParams): Observable<LeaderboardResponse> {
    this.isLoading.set(true);

    let params = new HttpParams();
    if (filter.period) params = params.set('period', filter.period);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.search) params = params.set('search', filter.search);
    if (filter.page !== undefined && filter.page !== null) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined && filter.size !== null) params = params.set('size', filter.size.toString());

    return this.http.get<LeaderboardResponse>(this.API_BASE, { params }).pipe(
      tap({
        next: (res) => {
          this.leaderboardData.set(res);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  getDeveloperDetails(username: string): Observable<DeveloperDetails> {
    return this.http.get<DeveloperDetails>(`${this.API_BASE}/developer/${encodeURIComponent(username)}`);
  }

  syncRankings(): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/sync`, {});
  }

  syncDeveloper(username: string): Observable<DeveloperDetails> {
    return this.http.post<DeveloperDetails>(`${this.API_BASE}/sync/${encodeURIComponent(username)}`, {});
  }
}

