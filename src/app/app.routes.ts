import { Routes } from '@angular/router';

import { Landing } from './public/landing/landing';
import { Login } from './public/login/login';
import { Register } from './public/register/register';
import { Quote } from './public/quote/quote';

import { AdminLayout } from './admin/layout/admin-layout';
import { Dashboard as AdminDashboard } from './admin/dashboard/dashboard';
import { Comments } from './admin/comments/comments';
import { Devices } from './admin/devices/devices';
import { Products } from './admin/products/products';
import { Production } from './admin/production/production';
import { RaspberryMonitor } from './admin/raspberry-monitor/raspberry-monitor';
import { RawMaterials } from './admin/raw-materials/raw-materials';
import { Routines } from './admin/routines/routines';
import { SupplierPurchases } from './admin/supplier-purchases/supplier-purchases';
import { Suppliers } from './admin/suppliers/suppliers';
import { Users } from './admin/users/users';

import { ClientLayout } from './client/layout/client-layout';
import { Profile } from './client/profile/profile';
import { Purchases } from './client/purchases/purchases';
import { Store } from './client/store/store';
import { Documentation } from './client/documentation/documentation';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'cotizacion', component: Quote },

  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: Users },
      { path: 'products', component: Products },
      { path: 'production', component: Production },
      { path: 'raw-materials', component: RawMaterials },
      { path: 'suppliers', component: Suppliers },
      { path: 'supplier-purchases', component: SupplierPurchases },
      { path: 'comments', component: Comments },
      { path: 'devices', component: Devices },
      { path: 'raspberry-monitor', component: RaspberryMonitor },
      { path: 'routines', component: Routines },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  {
    path: 'client',
    component: ClientLayout,
    children: [
      { path: 'store', component: Store },
      { path: 'purchases', component: Purchases },
      { path: 'profile', component: Profile },
      { path: 'documentation', component: Documentation },
      { path: '**', redirectTo: 'store' },
    ],
  },

  { path: '**', redirectTo: '' },
];
