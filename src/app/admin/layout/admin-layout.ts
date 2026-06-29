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
  links: SidebarLink[] = [
    { route: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { route: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
    { route: '/admin/devices', label: 'Dispositivos', icon: 'devices' },
    { route: '/admin/users', label: 'Usuarios', icon: 'group' },
    { route: '/admin/routines', label: 'Rutinas', icon: 'repeat' },
    { route: '/admin/raspberry-monitor', label: 'Monitor Raspberry', icon: 'monitor_heart' },
  ];
}
