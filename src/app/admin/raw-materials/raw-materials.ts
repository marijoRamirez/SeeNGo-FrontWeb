import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService, MateriaPrima } from '../../core/services/api';

@Component({
  selector: 'app-admin-raw-materials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './raw-materials.html',
  styleUrl: './raw-materials.scss',
})
export class RawMaterials implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1, 2];

  readonly materias = signal<MateriaPrima[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);

  readonly mostrandoForm = signal(false);
  readonly guardando = signal(false);
  readonly errorGuardar = signal<string | null>(null);
  readonly materiaEnEdicion = signal<MateriaPrima | null>(null);

  readonly materiaAEliminar = signal<MateriaPrima | null>(null);
  readonly eliminando = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    unidad: new FormControl('pieza', [Validators.required]),
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.api.getMateriasPrimas().subscribe({
      next: materias => {
        this.materias.set(materias);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la materia prima. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  abrirCrear() {
    this.materiaEnEdicion.set(null);
    this.form.reset({ nombre: '', unidad: 'pieza' });
    this.errorGuardar.set(null);
    this.mostrandoForm.set(true);
  }

  abrirEditar(materia: MateriaPrima) {
    this.materiaEnEdicion.set(materia);
    this.form.reset({ nombre: materia.nombre, unidad: materia.unidad });
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
    const data = {
      nombre: valores.nombre!.trim(),
      unidad: valores.unidad!.trim(),
    };

    this.guardando.set(true);
    this.errorGuardar.set(null);

    const enEdicion = this.materiaEnEdicion();
    const peticion: Observable<unknown> = enEdicion
      ? this.api.actualizarMateriaPrima(enEdicion.id, data)
      : this.api.crearMateriaPrima(data);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrandoForm.set(false);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorGuardar.set(err.error?.message ?? 'No se pudo guardar la materia prima.');
      },
    });
  }

  pedirEliminar(materia: MateriaPrima) {
    this.materiaAEliminar.set(materia);
  }

  cancelarEliminar() {
    if (!this.eliminando()) {
      this.materiaAEliminar.set(null);
    }
  }

  eliminar() {
    const materia = this.materiaAEliminar();
    if (!materia) {
      return;
    }

    this.eliminando.set(true);
    this.errorAccion.set(null);

    this.api.eliminarMateriaPrima(materia.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.materiaAEliminar.set(null);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.materiaAEliminar.set(null);
        this.errorAccion.set(err.error?.message ?? 'No se pudo eliminar la materia prima.');
      },
    });
  }
}
