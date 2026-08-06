import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, UsuarioAdmin, UsuarioCreado } from '../../core/services/api';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1, 2];

  readonly usuarios = signal<UsuarioAdmin[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);

  readonly mostrandoForm = signal(false);
  readonly guardando = signal(false);
  readonly errorGuardar = signal<string | null>(null);
  readonly usuarioCreado = signal<UsuarioCreado | null>(null);
  readonly passwordCopiada = signal(false);

  readonly usuarioAEliminar = signal<UsuarioAdmin | null>(null);
  readonly eliminando = signal(false);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('client', [Validators.required]),
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.api.getUsuariosAdmin(1, 100).subscribe({
      next: respuesta => {
        this.usuarios.set(respuesta.data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  abrirCrear() {
    this.form.reset({ name: '', email: '', role: 'client' });
    this.errorGuardar.set(null);
    this.usuarioCreado.set(null);
    this.passwordCopiada.set(false);
    this.mostrandoForm.set(true);
  }

  cerrarForm() {
    if (!this.guardando()) {
      this.mostrandoForm.set(false);
      this.usuarioCreado.set(null);
    }
  }

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.guardando.set(true);
    this.errorGuardar.set(null);

    this.api.crearUsuarioAdmin({
      name: valores.name!.trim(),
      email: valores.email!.trim(),
      role: valores.role!,
    }).subscribe({
      next: creado => {
        this.guardando.set(false);
        this.usuarioCreado.set(creado);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorGuardar.set(err.error?.message ?? 'No se pudo crear el usuario.');
      },
    });
  }

  copiarAccesos() {
    const creado = this.usuarioCreado();
    if (!creado) {
      return;
    }
    const texto = `Accesos SeeNGo\nUsuario: ${creado.email}\nContraseña temporal: ${creado.passwordTemporal}\nEntra en: https://seengo.up.railway.app/login`;
    navigator.clipboard.writeText(texto).then(() => {
      this.passwordCopiada.set(true);
    });
  }

  pedirEliminar(usuario: UsuarioAdmin) {
    this.usuarioAEliminar.set(usuario);
  }

  cancelarEliminar() {
    if (!this.eliminando()) {
      this.usuarioAEliminar.set(null);
    }
  }

  eliminar() {
    const usuario = this.usuarioAEliminar();
    if (!usuario) {
      return;
    }

    this.eliminando.set(true);
    this.errorAccion.set(null);

    this.api.eliminarUsuarioAdmin(usuario.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.usuarioAEliminar.set(null);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.usuarioAEliminar.set(null);
        this.errorAccion.set(err.error?.message ?? 'No se pudo eliminar el usuario.');
      },
    });
  }
}
