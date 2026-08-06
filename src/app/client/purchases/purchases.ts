import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, DocumentoProducto, Producto, Venta } from '../../core/services/api';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './purchases.html',
  styleUrl: './purchases.scss',
})
export class Purchases implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1];
  protected readonly estrellas = [1, 2, 3, 4, 5];

  readonly ventas = signal<Venta[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly resenaProducto = signal<{ id: string; nombre: string } | null>(null);
  readonly calificacion = signal(5);
  readonly comentario = signal('');
  readonly enviandoResena = signal(false);
  readonly errorResena = signal<string | null>(null);
  readonly resenaEnviada = signal(false);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarVentas();
    }
  }

  cargarVentas() {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      ventas: this.api.getMisVentas(),
      productos: this.api.getProductos(),
    }).subscribe({
      next: ({ ventas, productos }) => {
        this.ventas.set(ventas);
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err.status === 401
            ? 'Inicia sesión para ver tu historial de compras.'
            : 'No se pudieron cargar tus compras. Intenta de nuevo.'
        );
        this.cargando.set(false);
      },
    });
  }

  documentosDe(productoId: string): DocumentoProducto[] {
    return this.productos().find(p => p.id === productoId)?.documentos ?? [];
  }

  abrirResena(productoId: string, nombre: string) {
    this.resenaProducto.set({ id: productoId, nombre });
    this.calificacion.set(5);
    this.comentario.set('');
    this.errorResena.set(null);
    this.resenaEnviada.set(false);
  }

  cerrarResena() {
    if (!this.enviandoResena()) {
      this.resenaProducto.set(null);
    }
  }

  enviarResena() {
    const producto = this.resenaProducto();
    if (!producto) {
      return;
    }

    if (this.comentario().trim().length < 5) {
      this.errorResena.set('Cuéntanos un poco más sobre tu experiencia.');
      return;
    }

    this.enviandoResena.set(true);
    this.errorResena.set(null);

    this.api.crearResena({
      productoId: producto.id,
      calificacion: this.calificacion(),
      comentario: this.comentario().trim(),
    }).subscribe({
      next: () => {
        this.enviandoResena.set(false);
        this.resenaEnviada.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.enviandoResena.set(false);
        this.errorResena.set(err.error?.message ?? 'No se pudo enviar tu opinión. Intenta de nuevo.');
      },
    });
  }
}
