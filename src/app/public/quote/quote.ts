import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, Cotizacion, Producto } from '../../core/services/api';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './quote.html',
  styleUrl: './quote.scss',
})
export class Quote implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly errorCatalogo = signal<string | null>(null);

  readonly enviando = signal(false);
  readonly errorEnvio = signal<string | null>(null);
  readonly resultado = signal<Cotizacion | null>(null);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telefono: new FormControl(''),
    tipoPropiedad: new FormControl('casa', [Validators.required]),
    items: new FormArray([this.nuevoItem()]),
  });

  get items(): FormArray {
    return this.form.controls.items;
  }

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
        this.errorCatalogo.set('No se pudo cargar el catálogo de productos.');
        this.cargando.set(false);
      },
    });
  }

  agregarItem() {
    this.items.push(this.nuevoItem());
  }

  quitarItem(indice: number) {
    if (this.items.length > 1) {
      this.items.removeAt(indice);
    }
  }

  cotizar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.enviando.set(true);
    this.errorEnvio.set(null);

    this.api.crearCotizacion({
      nombre: valores.nombre!,
      email: valores.email!,
      telefono: valores.telefono ?? '',
      tipoPropiedad: valores.tipoPropiedad!,
      items: valores.items.map(item => ({
        productoId: item.productoId!,
        cantidad: Number(item.cantidad),
      })),
    }).subscribe({
      next: cotizacion => {
        this.enviando.set(false);
        this.resultado.set(cotizacion);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.errorEnvio.set(err.error?.message ?? 'No se pudo generar la cotización. Intenta de nuevo.');
      },
    });
  }

  nuevaCotizacion() {
    this.resultado.set(null);
    this.form.reset({ nombre: '', email: '', telefono: '', tipoPropiedad: 'casa' });
    this.items.clear();
    this.items.push(this.nuevoItem());
  }

  private nuevoItem() {
    return new FormGroup({
      productoId: new FormControl('', [Validators.required]),
      cantidad: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    });
  }
}
