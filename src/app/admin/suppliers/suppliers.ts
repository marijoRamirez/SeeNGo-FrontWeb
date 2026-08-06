import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService, GuardarProveedorDto, Proveedor } from '../../core/services/api';

@Component({
  selector: 'app-admin-suppliers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss',
})
export class Suppliers implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1, 2];

  readonly proveedores = signal<Proveedor[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);

  readonly mostrandoForm = signal(false);
  readonly guardando = signal(false);
  readonly errorGuardar = signal<string | null>(null);
  readonly proveedorEnEdicion = signal<Proveedor | null>(null);

  readonly proveedorAEliminar = signal<Proveedor | null>(null);
  readonly eliminando = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    contacto: new FormControl(''),
    telefono: new FormControl(''),
    email: new FormControl('', [Validators.email]),
    direccion: new FormControl(''),
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.api.getProveedores().subscribe({
      next: proveedores => {
        this.proveedores.set(proveedores);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los proveedores. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  abrirCrear() {
    this.proveedorEnEdicion.set(null);
    this.form.reset({ nombre: '', contacto: '', telefono: '', email: '', direccion: '' });
    this.errorGuardar.set(null);
    this.mostrandoForm.set(true);
  }

  abrirEditar(proveedor: Proveedor) {
    this.proveedorEnEdicion.set(proveedor);
    this.form.reset({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion ?? '',
    });
    this.errorGuardar.set(null);
    this.mostrandoForm.set(true);
  }

  cerrarForm() {
    if (!this.guardando()) {
      this.mostrandoForm.set(false);
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const data: GuardarProveedorDto = {
      nombre: valores.nombre!.trim(),
      contacto: valores.contacto?.trim() ?? '',
      telefono: valores.telefono?.trim() ?? '',
      email: valores.email?.trim() ?? '',
      direccion: valores.direccion?.trim() ? valores.direccion.trim() : null,
    };

    this.guardando.set(true);
    this.errorGuardar.set(null);

    const enEdicion = this.proveedorEnEdicion();
    const peticion: Observable<unknown> = enEdicion
      ? this.api.actualizarProveedor(enEdicion.id, data)
      : this.api.crearProveedor(data);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrandoForm.set(false);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorGuardar.set(err.error?.message ?? 'No se pudo guardar el proveedor.');
      },
    });
  }

  pedirEliminar(proveedor: Proveedor) {
    this.proveedorAEliminar.set(proveedor);
  }

  cancelarEliminar() {
    if (!this.eliminando()) {
      this.proveedorAEliminar.set(null);
    }
  }

  eliminar() {
    const proveedor = this.proveedorAEliminar();
    if (!proveedor) {
      return;
    }

    this.eliminando.set(true);
    this.errorAccion.set(null);

    this.api.eliminarProveedor(proveedor.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.proveedorAEliminar.set(null);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.proveedorAEliminar.set(null);
        this.errorAccion.set(err.error?.message ?? 'No se pudo eliminar el proveedor.');
      },
    });
  }
}
