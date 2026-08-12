import { Component, OnInit, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  ApiService,
  AdminMetrics,
  Cotizacion,
  DeviceUsage,
  MensajeContacto,
  MonitorRaspberry,
  Producto,
  ResenaAdmin,
  Venta,
} from '../../core/services/api';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1, 2, 3, 4, 5];

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly metricas = signal<AdminMetrics | null>(null);
  readonly ventas = signal<Venta[]>([]);
  readonly resenas = signal<ResenaAdmin[]>([]);
  readonly cotizaciones = signal<Cotizacion[]>([]);
  readonly mensajes = signal<MensajeContacto[]>([]);
  readonly raspberries = signal<MonitorRaspberry[]>([]);
  readonly uso = signal<DeviceUsage | null>(null);
  readonly productos = signal<Producto[]>([]);

  readonly hora = new Date();

  readonly totalVentas = computed(() => this.ventas().length);
  readonly ingresos = computed(() => this.ventas().reduce((suma, v) => suma + v.total, 0));
  readonly resenasPendientes = computed(() => this.resenas().filter(r => r.estado === 'pendiente').length);
  readonly mensajesSinAtender = computed(() => this.mensajes().filter(m => !m.atendido).length);
  readonly cotizacionesPendientes = computed(() => this.cotizaciones().length);
  readonly raspberriesOnline = computed(() => this.raspberries().filter(r => r.status === 'Online').length);

  readonly ultimasVentas = computed(() =>
    [...this.ventas()]
      .sort((a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime())
      .slice(0, 5)
  );

  readonly resenasRecientes = computed(() =>
    [...this.resenas()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  readonly mensajesRecientes = computed(() =>
    [...this.mensajes()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  readonly productosBajoStock = computed(() =>
    [...this.productos()].sort((a, b) => a.stock - b.stock).slice(0, 5)
  );

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      metricas: this.api.getAdminMetrics(),
      ventas: this.api.getTodasVentas(),
      resenas: this.api.getResenasAdmin(),
      cotizaciones: this.api.getCotizacionesAdmin(),
      mensajes: this.api.getMensajesContacto(),
      raspberries: this.api.getMonitorRaspberries(),
      uso: this.api.getDeviceUsage('week'),
      productos: this.api.getProductos(),
    }).subscribe({
      next: ({ metricas, ventas, resenas, cotizaciones, mensajes, raspberries, uso, productos }) => {
        this.metricas.set(metricas);
        this.ventas.set(ventas);
        this.resenas.set(resenas);
        this.cotizaciones.set(cotizaciones);
        this.mensajes.set(mensajes);
        this.raspberries.set(raspberries);
        this.uso.set(uso);
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del panel. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  maxKwh(uso: DeviceUsage): number {
    return uso.kwhData.length ? Math.max(...uso.kwhData) : 0;
  }

  maxEventos(uso: DeviceUsage): number {
    return uso.hourlyFrequencies.length ? Math.max(...uso.hourlyFrequencies) : 0;
  }
}