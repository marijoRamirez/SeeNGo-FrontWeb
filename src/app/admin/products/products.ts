import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { ApiService, GuardarProductoDto, MateriaPrima, Producto } from '../../core/services/api';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1, 2];

  readonly productos = signal<Producto[]>([]);
  readonly materias = signal<MateriaPrima[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);

  readonly mostrandoForm = signal(false);
  readonly guardando = signal(false);
  readonly errorGuardar = signal<string | null>(null);
  readonly productoEnEdicion = signal<Producto | null>(null);

  readonly productoAEliminar = signal<Producto | null>(null);
  readonly eliminando = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    descripcion: new FormControl(''),
    precio: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    stock: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    imagenUrl: new FormControl(''),
    receta: new FormArray<FormGroup>([]),
    documentos: new FormArray<FormGroup>([]),
  });

  get receta(): FormArray<FormGroup> {
    return this.form.controls.receta;
  }

  get documentos(): FormArray<FormGroup> {
    return this.form.controls.documentos;
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
      productos: this.api.getProductos(),
      materias: this.api.getMateriasPrimas(),
    }).subscribe({
      next: ({ productos, materias }) => {
        this.productos.set(productos);
        this.materias.set(materias);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  abrirCrear() {
    this.productoEnEdicion.set(null);
    this.form.reset({ nombre: '', descripcion: '', precio: null, stock: null, imagenUrl: '' });
    this.receta.clear();
    this.documentos.clear();
    this.errorGuardar.set(null);
    this.mostrandoForm.set(true);
  }

  abrirEditar(producto: Producto) {
    this.productoEnEdicion.set(producto);
    this.form.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagenUrl: producto.imagenUrl ?? '',
    });
    this.receta.clear();
    for (const item of producto.receta ?? []) {
      this.receta.push(this.filaReceta(item.materiaPrimaId, item.cantidad));
    }
    this.documentos.clear();
    for (const documento of producto.documentos ?? []) {
      this.documentos.push(this.filaDocumento(documento.titulo, documento.url));
    }
    this.errorGuardar.set(null);
    this.mostrandoForm.set(true);
  }

  cerrarForm() {
    if (!this.guardando()) {
      this.mostrandoForm.set(false);
    }
  }

  agregarIngrediente() {
    this.receta.push(this.filaReceta('', 1));
  }

  quitarIngrediente(indice: number) {
    this.receta.removeAt(indice);
  }

  agregarDocumento() {
    this.documentos.push(this.filaDocumento('', ''));
  }

  quitarDocumento(indice: number) {
    this.documentos.removeAt(indice);
  }

  costoEstimado(): number {
    return this.receta.controls.reduce((suma, fila) => {
      const materiaPrimaId = fila.get('materiaPrimaId')?.value;
      const cantidad = Number(fila.get('cantidad')?.value) || 0;
      const materia = this.materias().find(m => m.id === materiaPrimaId);
      return suma + cantidad * (materia?.costoPromedio ?? 0);
    }, 0);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const data: GuardarProductoDto = {
      nombre: valores.nombre!.trim(),
      descripcion: valores.descripcion?.trim() ?? '',
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      imagenUrl: valores.imagenUrl?.trim() ? valores.imagenUrl.trim() : null,
      receta: this.receta.controls
        .filter(fila => fila.get('materiaPrimaId')?.value)
        .map(fila => ({
          materiaPrimaId: fila.get('materiaPrimaId')!.value,
          cantidad: Number(fila.get('cantidad')!.value),
        })),
      documentos: this.documentos.controls
        .filter(fila => fila.get('titulo')?.value?.trim() && fila.get('url')?.value?.trim())
        .map(fila => ({
          titulo: fila.get('titulo')!.value.trim(),
          url: fila.get('url')!.value.trim(),
        })),
    };

    this.guardando.set(true);
    this.errorGuardar.set(null);

    const enEdicion = this.productoEnEdicion();
    const peticion: Observable<unknown> = enEdicion
      ? this.api.actualizarProducto(enEdicion.id, data)
      : this.api.crearProducto(data);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrandoForm.set(false);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.errorGuardar.set(err.error?.message ?? 'No se pudo guardar el producto.');
      },
    });
  }

  pedirEliminar(producto: Producto) {
    this.productoAEliminar.set(producto);
  }

  cancelarEliminar() {
    if (!this.eliminando()) {
      this.productoAEliminar.set(null);
    }
  }

  eliminar() {
    const producto = this.productoAEliminar();
    if (!producto) {
      return;
    }

    this.eliminando.set(true);
    this.errorAccion.set(null);

    this.api.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.productoAEliminar.set(null);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminando.set(false);
        this.productoAEliminar.set(null);
        this.errorAccion.set(err.error?.message ?? 'No se pudo eliminar el producto.');
      },
    });
  }

  private filaReceta(materiaPrimaId: string, cantidad: number): FormGroup {
    return new FormGroup({
      materiaPrimaId: new FormControl(materiaPrimaId, [Validators.required]),
      cantidad: new FormControl<number>(cantidad, [Validators.required, Validators.min(0.01)]),
    });
  }

  private filaDocumento(titulo: string, url: string): FormGroup {
    return new FormGroup({
      titulo: new FormControl(titulo),
      url: new FormControl(url),
    });
  }
}
