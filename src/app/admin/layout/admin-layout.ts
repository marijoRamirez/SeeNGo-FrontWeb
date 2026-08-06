import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar, SidebarLink } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  sidebarCollapsed: boolean = false;
  links: SidebarLink[] = [
    { route: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { route: '/admin/users', label: 'Usuarios', icon: 'group' },
    { route: '/admin/products', label: 'Productos', icon: 'inventory_2' },
    { route: '/admin/production', label: 'Producción', icon: 'precision_manufacturing' },
    { route: '/admin/raw-materials', label: 'Materia prima', icon: 'category' },
    { route: '/admin/suppliers', label: 'Proveedores', icon: 'local_shipping' },
    { route: '/admin/supplier-purchases', label: 'Compras', icon: 'shopping_basket' },
    { route: '/admin/comments', label: 'Comentarios', icon: 'rate_review' },
    { route: '/admin/raspberry-monitor', label: 'Monitor Raspberry', icon: 'monitor_heart' },
    { route: '/', label: 'Regresar', icon: 'logout' }
  ];
}
