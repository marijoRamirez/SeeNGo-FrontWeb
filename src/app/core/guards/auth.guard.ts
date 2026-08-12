import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

const isServer = (): boolean => typeof window === 'undefined';

export const authGuard: CanActivateFn = () => {
  if (isServer()) return true;

  const auth = inject(AuthService);
  if (auth.isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    if (isServer()) return true;

    const auth = inject(AuthService);
    const user = auth.getUser();
    const router = inject(Router);

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    if (user?.role === 'admin') {
      return router.createUrlTree(['/admin/dashboard']);
    }

    return router.createUrlTree(['/login']);
  };
}