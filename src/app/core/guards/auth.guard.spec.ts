import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';

import { AuthService, AuthUser } from '../services/auth';
import { authGuard, roleGuard } from './auth.guard';

const fakeUser = (role: string): AuthUser => ({
  id: '1',
  name: 'Ana',
  email: 'a@a.com',
  role,
});

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('should allow access when the user is authenticated', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify(fakeUser('client')));

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBeTruthy();
  });

  it('should redirect to /login when there is no session', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});

describe('roleGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('should allow a user with an allowed role', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify(fakeUser('admin')));

    const result = TestBed.runInInjectionContext(() => roleGuard(['admin'])({} as never, {} as never));
    expect(result).toBeTruthy();
  });

  it('should redirect an admin hitting client routes to the admin dashboard', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify(fakeUser('admin')));

    const result = TestBed.runInInjectionContext(() => roleGuard(['client'])({} as never, {} as never));
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/admin/dashboard');
  });

  it('should redirect a client hitting admin routes to /login', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify(fakeUser('client')));

    const result = TestBed.runInInjectionContext(() => roleGuard(['admin'])({} as never, {} as never));
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});