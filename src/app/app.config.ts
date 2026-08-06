import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { ApiService } from './core/services/api';
import { AuthService } from './core/services/auth';

import { authInterceptor } from './core/interceptors/auth.interceptor';

registerLocaleData(localeEsMx);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(),
    ApiService, AuthService,
    { provide: LOCALE_ID, useValue: 'es-MX' }
  ]
};
