import { Routes } from '@angular/router';

import { Landing } from './public/landing/landing';
import { Login } from './public/login/login';
import { Dashboard as ClientDashboard } from './client/dashboard/dashboard';
import { Dashboard as AdminDashboard } from './admin/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Landing }, 
  { path: 'login', component: Login },
  { path: 'client/dashboard', component: ClientDashboard },
  { path: 'admin/dashboard', component: AdminDashboard },
  { path: '**', redirectTo: '' } 
];