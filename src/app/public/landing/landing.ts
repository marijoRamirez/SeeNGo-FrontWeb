import { Component, HostListener, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Resena } from '../../core/services/api';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  isLogged: boolean = false;
  showUserMenu: boolean = false;
  userRole: string = '';

  readonly resenas = signal<Resena[]>([]);
  readonly estrellas = [1, 2, 3, 4, 5];

  readonly enviandoContacto = signal(false);
  readonly contactoEnviado = signal(false);
  readonly errorContacto = signal<string | null>(null);

  contactoForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    mensaje: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  ngOnInit() {
    this.auth.isLoggedIn$.subscribe(logged => {
      this.isLogged = logged;
    });

    this.auth.user$.subscribe(user => {
      this.userRole = user?.role ?? '';
    });

    if (isPlatformBrowser(this.platformId)) {
      this.api.getResenas().subscribe({
        next: resenas => this.resenas.set(resenas),
        error: () => {},
      });
    }
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

  enviarContacto() {
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched();
      return;
    }

    const valores = this.contactoForm.getRawValue();
    this.enviandoContacto.set(true);
    this.errorContacto.set(null);

    this.api.enviarContacto({
      nombre: valores.nombre!,
      email: valores.email!,
      mensaje: valores.mensaje!,
    }).subscribe({
      next: () => {
        this.enviandoContacto.set(false);
        this.contactoEnviado.set(true);
        this.contactoForm.reset();
      },
      error: () => {
        this.enviandoContacto.set(false);
        this.errorContacto.set('No se pudo enviar el mensaje. Intenta de nuevo.');
      },
    });
  }
}
