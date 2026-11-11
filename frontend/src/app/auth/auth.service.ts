import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { AuthResponse, UserProfile } from './auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'rankgit_auth_token';
  private readonly API_BASE = environment.apiUrl;

  // Signals para estado reativo moderno
  currentUser = signal<UserProfile | null>(null);
  isLoading = signal<boolean>(false);

  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkInitialSession();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.loadCurrentUser().subscribe();
  }

  loginWithGitHub(): void {
    window.location.href = `${this.API_BASE}/oauth2/authorization/github`;
  }

  loginWithGitHubUsername(username: string): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.API_BASE}/api/auth/github`, { username })
      .pipe(
        tap(res => {
          if (res.token) {
            this.setToken(res.token);
            this.currentUser.set(res.user);
          }
          this.isLoading.set(false);
        }),
        catchError(err => {
          this.isLoading.set(false);
          throw err;
        })
      );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.API_BASE}/api/auth/login`, { username, password })
      .pipe(
        tap(res => {
          if (res.token) {
            this.setToken(res.token);
            this.currentUser.set(res.user);
          }
          this.isLoading.set(false);
        }),
        catchError(err => {
          this.isLoading.set(false);
          throw err;
        })
      );
  }

  register(username: string, password: string, name?: string, email?: string): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.API_BASE}/api/auth/register`, { username, password, name, email })
      .pipe(
        tap(res => {
          if (res.token) {
            this.setToken(res.token);
            this.currentUser.set(res.user);
          }
          this.isLoading.set(false);
        }),
        catchError(err => {
          this.isLoading.set(false);
          throw err;
        })
      );
  }

  devLogin(username = 'carlos', asAdmin = true): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.API_BASE}/api/auth/dev-login?username=${username}&asAdmin=${asAdmin}`, {})
      .pipe(
        tap(res => {
          if (res.token) {
            this.setToken(res.token);
          }
          this.currentUser.set(res.user);
          this.isLoading.set(false);
        }),
        catchError(err => {
          this.isLoading.set(false);
          throw err;
        })
      );
  }

  loadCurrentUser(): Observable<UserProfile | null> {
    const token = this.getToken();
    if (!token) {
      this.currentUser.set(null);
      return of(null);
    }

    this.isLoading.set(true);
    return this.http.get<UserProfile>(`${this.API_BASE}/api/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.logout();
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private checkInitialSession(): void {
    if (this.getToken()) {
      this.loadCurrentUser().subscribe();
    }
  }
}
