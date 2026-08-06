import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Producto, Venta } from '../../core/services/api';
import { AuthService } from '../../core/services/auth';
import { CartService } from '../../core/services/cart';

type EstadoCompra = 'inactivo' | 'enviando' | 'exito';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './store.html',
  styleUrl: './store.scss',
})
export class Store implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  protected auth = inject(AuthService);
  protected cart = inject(CartService);

  protected readonly skeletons = [0, 1, 2, 3, 4, 5];

  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly errorCatalogo = signal<string | null>(null);

  readonly estadoCompra = signal<EstadoCompra>('inactivo');
  readonly errorCompra = signal<string | null>(null);
  readonly ultimaCompra = signal<Venta | null>(null);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarProductos();
    }
  }

  cargarProductos() {
    this.cargando.set(true);
    this.errorCatalogo.set(null);
    this.api.getProductos().subscribe({
      next: productos => {
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCatalogo.set('No se pudo cargar el catálogo. Revisa tu conexión e intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  cantidadEnCarrito(productoId: string): number {
    return this.cart.items().find(item => item.producto.id === productoId)?.cantidad ?? 0;
  }

  finalizarCompra() {
    const items = this.cart.items().map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
    }));
    if (items.length === 0) {
      return;
    }

    this.estadoCompra.set('enviando');
    this.errorCompra.set(null);

    this.api.crearVenta(items).subscribe({
      next: venta => {
        this.ultimaCompra.set(venta);
        this.estadoCompra.set('exito');
        this.cart.vaciar();
        this.cargarProductos();
      },
      error: err => {
        this.estadoCompra.set('inactivo');
        this.errorCompra.set(err?.error?.message ?? 'No se pudo completar la compra. Intenta de nuevo.');
      },
    });
  }

  seguirComprando() {
    this.estadoCompra.set('inactivo');
    this.ultimaCompra.set(null);
  }
}
