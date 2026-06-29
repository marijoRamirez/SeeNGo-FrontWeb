import { Routes } from '@angular/router';

import { Landing } from './public/landing/landing';
import { Login } from './public/login/login';

import { AdminLayout } from './admin/layout/admin-layout';
import { Dashboard as AdminDashboard } from './admin/dashboard/dashboard';
import { Analytics } from './admin/analytics/analytics';
import { Devices } from './admin/devices/devices';
import { RaspberryMonitor } from './admin/raspberry-monitor/raspberry-monitor';
import { Routines } from './admin/routines/routines';
import { Users } from './admin/users/users';

import { ClientLayout } from './client/layout/client-layout';
import { Dashboard as ClientDashboard } from './client/dashboard/dashboard';
import { Documentation } from './client/documentation/documentation';
import { Profile } from './client/profile/profile';
import { Purchases } from './client/purchases/purchases';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },

  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'analytics', component: Analytics },
      { path: 'devices', component: Devices },
      { path: 'raspberry-monitor', component: RaspberryMonitor },
      { path: 'routines', component: Routines },
      { path: 'users', component: Users },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  {
    path: 'client',
    component: ClientLayout,
    children: [
      { path: 'dashboard', component: ClientDashboard },
      { path: 'documentation', component: Documentation },
      { path: 'profile', component: Profile },
      { path: 'purchases', component: Purchases },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  { path: '**', redirectTo: '' },
];
