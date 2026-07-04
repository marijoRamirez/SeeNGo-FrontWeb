import { Component, HostListener, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  private auth = inject(AuthService);

  isLogged: boolean = false;
  showUserMenu: boolean = false;

  ngOnInit() {
    this.auth.isLoggedIn$.subscribe(logged => {
      this.isLogged = logged;
    });
  }

  toggleMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
  }

  logout() {
    this.auth.logout();
    this.showUserMenu = false;
  }
}
