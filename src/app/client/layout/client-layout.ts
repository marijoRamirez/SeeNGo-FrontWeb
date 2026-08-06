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
  sidebarCollapsed: boolean = false;

  links: SidebarLink[] = [
    { route: '/client/store', label: 'Tienda', icon: 'storefront' },
    { route: '/client/purchases', label: 'Mis compras', icon: 'receipt_long' },
    { route: '/client/profile', label: 'Mi perfil', icon: 'person' },
    { route: '/', label: 'Regresar', icon: 'logout' },
  ];
}
