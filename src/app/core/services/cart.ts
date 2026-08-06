import { Injectable, computed, signal } from '@angular/core';
import { Producto } from './api';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

const CART_STORAGE_KEY = 'seengo-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.restaurar());

  readonly items = this.itemsSignal.asReadonly();

  readonly totalArticulos = computed(() =>
    this.itemsSignal().reduce((suma, item) => suma + item.cantidad, 0)
  );

  readonly total = computed(() =>
    this.itemsSignal().reduce((suma, item) => suma + item.cantidad * item.producto.precio, 0)
  );

  agregar(producto: Producto): void {
    this.actualizar(items => {
      const existente = items.find(item => item.producto.id === producto.id);
      if (!existente) {
        return [...items, { producto, cantidad: 1 }];
      }
      return items.map(item =>
        item.producto.id === producto.id
          ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stock) }
          : item
      );
    });
  }

  cambiarCantidad(productoId: string, cantidad: number): void {
    this.actualizar(items =>
      items
        .map(item =>
          item.producto.id === productoId
            ? { ...item, cantidad: Math.min(Math.max(cantidad, 0), item.producto.stock) }
            : item
        )
        .filter(item => item.cantidad > 0)
    );
  }

  quitar(productoId: string): void {
    this.actualizar(items => items.filter(item => item.producto.id !== productoId));
  }

  vaciar(): void {
    this.actualizar(() => []);
  }

  private actualizar(transformar: (items: CartItem[]) => CartItem[]): void {
    this.itemsSignal.update(transformar);
    this.persistir();
  }

  private restaurar(): CartItem[] {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const guardado = localStorage.getItem(CART_STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  }

  private persistir(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.itemsSignal()));
  }
}
