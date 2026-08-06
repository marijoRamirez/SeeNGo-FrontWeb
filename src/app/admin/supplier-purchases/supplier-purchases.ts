import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService, CompraProveedor, MateriaPrima, Proveedor } from '../../core/services/api';

@Component({
  selector: 'app-admin-supplier-purchases',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './supplier-purchases.html',
  styleUrl: './supplier-purchases.scss',
})
export class SupplierPurchases implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1];

  readonly compras = signal<CompraProveedor[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly materias = signal<MateriaPrima[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly guardando = signal(false);
  readonly errorGuardar = signal<string | null>(null);

  form = new FormGroup({
    proveedorId: new FormControl('', [Validators.required]),
    items: new FormArray([this.nuevoItem()]),
  });

  get items(): FormArray {
    return this.form.controls.items;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      compras: this.api.getCompras(),
      proveedores: this.api.getProveedores(),
      materias: this.api.getMateriasPrimas(),
    }).subscribe({
      next: ({ compras, proveedores, materias }) => {
        this.compras.set(compras);
        this.proveedores.set(proveedores);
        this.materias.set(materias);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las compras. Intenta de nuevo.');
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

  totalEstimado(): number {
    return this.items.controls.reduce((suma, control) => {
      const cantidad = Number(control.get('cantidad')?.value) || 0;
      const costo = Number(control.get('costoUnitario')?.value) || 0;
      return suma + cantidad * costo;
    }, 0);
  }

  registrarCompra() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.guardando.set(true);
    this.errorGuardar.set(null);

    this.api.crearCompra({
      proveedorId: valores.proveedorId!,
      items: valores.items.map(item => ({
        materiaPrimaId: item.materiaPrimaId!,
        cantidad: Number(item.cantidad),
        costoUnitario: Number(item.costoUnitario),
      })),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.form.reset({ proveedorId: '' });
        this.items.clear();
        this.items.push(this.nuevoItem());
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorGuardar.set(err.error?.message ?? 'No se pudo registrar la compra.');
      },
    });
  }

  private nuevoItem() {
    return new FormGroup({
      materiaPrimaId: new FormControl('', [Validators.required]),
      cantidad: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
      costoUnitario: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    });
  }
}
