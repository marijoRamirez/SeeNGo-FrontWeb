import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarLink {
  route: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() links: SidebarLink[] = [];
}
