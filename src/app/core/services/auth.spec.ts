import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';

import { AuthService } from './auth';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  it('should be authenticated when a token and a valid user are stored', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Ana', email: 'a@a.com', role: 'client' }));

    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBeTruthy();
    expect(service.getUser()?.role).toBe('client');
  });

  it('should not be authenticated with a corrupted stored user', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', '{not-valid-json');

    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.getUser()).toBeNull();
  });

  it('should not be authenticated with an incomplete stored user', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'a@a.com' }));

    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should clear the session and navigate to login on logout', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Ana', email: 'a@a.com', role: 'client' }));

    const service = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.getUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalsy();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should clear the session on handleSessionExpired', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Ana', email: 'a@a.com', role: 'client' }));

    const service = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.handleSessionExpired();

    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.getUser()).toBeNull();
  });
});