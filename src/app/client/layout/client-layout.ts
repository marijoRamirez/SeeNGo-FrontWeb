import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar, SidebarLink } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-client-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.scss',
})
export class ClientLayout {
  links: SidebarLink[] = [
    { route: '/client/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { route: '/client/documentation', label: 'Documentación', icon: 'description' },
    { route: '/client/purchases', label: 'Mis dispositivos', icon: 'shopping_bag' },
    { route: '/client/profile', label: 'Mi perfil', icon: 'person' },
  ];
}
