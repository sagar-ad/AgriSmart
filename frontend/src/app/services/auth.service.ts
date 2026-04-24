import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';
  
  // Angular signals for reactive state
  private _user = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  
  // Computed values
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly userRole = computed(() => this._user()?.role || null);

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this._user.set(user);
        this._isAuthenticated.set(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        }
      })
    );
  }

  register(data: { email: string; password: string; name: string; role: string; phone?: string; location?: string }): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/register', data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        }
      })
    );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private setAuth(user: User, accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this._isAuthenticated.set(true);
    this.redirectByRole(user.role);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
    this._isAuthenticated.set(false);
  }

  private redirectByRole(role: string): void {
    const routes: Record<string, string> = {
      super_admin: '/super-admin',
      admin: '/admin',
      farmer: '/farmer'
    };
    this.router.navigate([routes[role] || '/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.api.post('/auth/refresh', { refreshToken }).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  hasRole(roles: string[]): boolean {
    const currentRole = this.userRole();
    return currentRole ? roles.includes(currentRole) : false;
  }
}