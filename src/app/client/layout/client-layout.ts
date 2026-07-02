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
    { route: '/client/profile', label: 'Mi perfil', icon: 'person' },
    { route: '/client/purchases', label: 'Mis compras', icon: 'shopping_cart' },
    { route: '/src/app/public/landing/landing.html', label: 'Regresar', icon: 'logout' },
  ];
}
