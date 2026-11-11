import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserProfile } from '../auth/auth.model';
import { environment } from '../../environments/environment';

export interface SyncSummary {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  finishedAt: string;
  message: string;
}

export interface AdminUsersPageResponse {
  users: UserProfile[];
  page: number;
  size: number;
  totalUsers: number;
  totalPages: number;
}

export interface AdminUserFormData {
  username: string;
  password?: string;
  name?: string;
  email?: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  approved?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_BASE = `${environment.apiUrl}/api/admin`;

  isProcessing = signal<boolean>(false);
  lastSyncMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  addDeveloper(githubInput: string): Observable<any> {
    this.isProcessing.set(true);
    return this.http.post(`${this.API_BASE}/developers`, { githubInput }).pipe(
      tap({
        next: () => this.isProcessing.set(false),
        error: () => this.isProcessing.set(false)
      })
    );
  }

  syncAll(): Observable<SyncSummary> {
    this.isProcessing.set(true);
    return this.http.post<SyncSummary>(`${this.API_BASE}/sync`, {}).pipe(
      tap({
        next: (res) => {
          this.isProcessing.set(false);
          this.lastSyncMessage.set(`Sincronizados: ${res.successCount}/${res.totalProcessed} devs.`);
        },
        error: () => this.isProcessing.set(false)
      })
    );
  }

  deleteDeveloper(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/developers/${id}`);
  }

  // ==========================================
  // CRUD de Usuários do Sistema
  // ==========================================

  getUsers(page: number = 0, size: number = 10): Observable<AdminUsersPageResponse> {
    return this.http.get<AdminUsersPageResponse>(`${this.API_BASE}/users?page=${page}&size=${size}`);
  }

  createUser(data: AdminUserFormData): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.API_BASE}/users`, data);
  }

  updateUser(id: number, data: AdminUserFormData): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API_BASE}/users/${id}`, data);
  }

  toggleUserApproval(id: number): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.API_BASE}/users/${id}/toggle-approval`, {});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/users/${id}`);
  }
}
