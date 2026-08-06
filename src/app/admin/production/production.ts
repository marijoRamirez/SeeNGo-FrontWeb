import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService, Produccion, Producto } from '../../core/services/api';

const ETIQUETAS_ESTADO: Record<string, string> = {
  planificado: 'Planificado',
  en_produccion: 'En producción',
  control_calidad: 'Control de calidad',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

@Component({
  selector: 'app-admin-production',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1];

  readonly lotes = signal<Produccion[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly creando = signal(false);
  readonly errorCrear = signal<string | null>(null);

  readonly actualizandoId = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);

  readonly loteAEliminar = signal<Produccion | null>(null);
  readonly eliminando = signal(false);

  form = new FormGroup({
    productoId: new FormControl('', [Validators.required]),
    cantidadPlaneada: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    notas: new FormControl(''),
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      lotes: this.api.getProduccion(),
      productos: this.api.getProductos(),
    }).subscribe({
      next: ({ lotes, productos }) => {
        this.lotes.set(lotes);
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la producción. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  crearLote() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.creando.set(true);
    this.errorCrear.set(null);

    this.api.crearProduccion({
      productoId: valores.productoId!,
      cantidadPlaneada: Number(valores.cantidadPlaneada),
      notas: valores.notas?.trim() ? valores.notas.trim() : null,
    }).subscribe({
      next: lote => {
        this.lotes.update(lotes => [lote, ...lotes]);
        this.form.reset({ productoId: '', cantidadPlaneada: null, notas: '' });
        this.creando.set(false);
      },
      error: err => {
        this.creando.set(false);
        this.errorCrear.set(err?.error?.message ?? 'No se pudo crear el lote.');
      },
    });
  }

  avanzar(lote: Produccion, estado: string, cantidadProducida: number) {
    if (Number.isNaN(cantidadProducida) || cantidadProducida < 0) {
      this.errorAccion.set('Indica una cantidad producida válida.');
      return;
    }

    this.actualizandoId.set(lote.id);
    this.errorAccion.set(null);

    this.api.actualizarProduccion(lote.id, {
      estado,
      cantidadProducida,
      notas: lote.notas,
    }).subscribe({
      next: actualizado => {
        this.lotes.update(lotes => lotes.map(l => (l.id === actualizado.id ? actualizado : l)));
        this.actualizandoId.set(null);
        if (estado === 'completado') {
          this.refrescarProductos();
        }
      },
      error: err => {
        this.actualizandoId.set(null);
        this.errorAccion.set(err?.error?.message ?? 'No se pudo actualizar el lote.');
      },
    });
  }

  pedirEliminar(lote: Produccion) {
    this.loteAEliminar.set(lote);
  }

  cancelarEliminar() {
    if (!this.eliminando()) {
      this.loteAEliminar.set(null);
    }
  }

  eliminar() {
    const lote = this.loteAEliminar();
    if (!lote) {
      return;
    }

    this.eliminando.set(true);
    this.errorAccion.set(null);

    this.api.eliminarProduccion(lote.id).subscribe({
      next: () => {
        this.lotes.update(lotes => lotes.filter(l => l.id !== lote.id));
        this.eliminando.set(false);
        this.loteAEliminar.set(null);
      },
      error: err => {
        this.eliminando.set(false);
        this.loteAEliminar.set(null);
        this.errorAccion.set(err?.error?.message ?? 'No se pudo eliminar el lote.');
      },
    });
  }

  etiquetaEstado(estado: string): string {
    return ETIQUETAS_ESTADO[estado] ?? estado;
  }

  progreso(lote: Produccion): number {
    if (lote.cantidadPlaneada === 0) {
      return 0;
    }
    return Math.min(100, Math.round((lote.cantidadProducida / lote.cantidadPlaneada) * 100));
  }

  cantidadSugerida(lote: Produccion): number {
    return lote.cantidadProducida > 0 ? lote.cantidadProducida : lote.cantidadPlaneada;
  }

  private refrescarProductos() {
    this.api.getProductos().subscribe({
      next: productos => this.productos.set(productos),
      error: () => {},
    });
  }
}
