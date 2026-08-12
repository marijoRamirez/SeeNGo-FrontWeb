import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService, LoginResponse, RegisterResponse } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  register(name: string, email: string, password: string): Observable<RegisterResponse> {
    return this.api.register(name, email, password);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.login(email, password).pipe(
      tap(res => {
        const user = {
          id: String(res.user.id),
          name: res.user.name,
          email: res.user.email,
          role: res.user.role
        };
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(user));
        this.loggedInSubject.next(true);
        this.userSubject.next(user);
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loggedInSubject.next(false);
    this.userSubject.next(null);
  }

  handleSessionExpired(): void {
    this.clearSession();
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    return this.hasToken() && !!this.getUser();
  }

  getUser(): AuthUser | null {
    return this.userSubject.getValue();
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private hasToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  private getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.id === 'string' &&
        typeof parsed.email === 'string' &&
        typeof parsed.role === 'string'
      ) {
        return {
          id: parsed.id,
          name: typeof parsed.name === 'string' ? parsed.name : '',
          email: parsed.email,
          role: parsed.role,
        };
      }
    } catch {
      return null;
    }
    return null;
  }
}
