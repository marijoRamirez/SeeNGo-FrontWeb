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
    { route: '/client/profile', label: 'Mi perfil', icon: 'person' },
    { route: '/src/app/public/landing/landing.html', label: 'Cerrar sesión', icon: 'logout' },
  ];
}
