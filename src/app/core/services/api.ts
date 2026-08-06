import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AdminSummary {
  usuariosActivos: number;
  dispositivosRegistrados: number;
  alertasPendientes: number;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface RecetaItem {
  materiaPrimaId: string;
  nombre: string;
  unidad: string;
  cantidad: number;
}

export interface DocumentoProducto {
  titulo: string;
  url: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  receta: RecetaItem[];
  documentos: DocumentoProducto[];
  createdAt: string;
}

export interface VentaItem {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Venta {
  id: string;
  userId: string;
  items: VentaItem[];
  total: number;
  fechaVenta: string;
}

export interface NuevaVentaItem {
  productoId: string;
  cantidad: number;
}

export interface GuardarProductoDto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  receta: { materiaPrimaId: string; cantidad: number }[];
  documentos: { titulo: string; url: string }[];
}

export interface Resena {
  id: string;
  userName: string;
  productoNombre: string;
  calificacion: number;
  comentario: string;
  createdAt: string;
}

export interface ResenaAdmin extends Resena {
  userId: string;
  productoId: string;
  estado: string;
  respuesta: string | null;
}

export interface CotizacionItem {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Cotizacion {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipoPropiedad: string;
  items: CotizacionItem[];
  total: number;
  createdAt: string;
}

export interface MensajeContacto {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  atendido: boolean;
  createdAt: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string | null;
  createdAt: string;
}

export interface GuardarProveedorDto {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string | null;
}

export interface MateriaPrima {
  id: string;
  nombre: string;
  unidad: string;
  existencia: number;
  costoPromedio: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompraItem {
  materiaPrimaId: string;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
}

export interface CompraProveedor {
  id: string;
  proveedorId: string;
  proveedorNombre: string;
  items: CompraItem[];
  total: number;
  createdAt: string;
}

export interface UsuarioAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UsuarioCreado extends UsuarioAdmin {
  passwordTemporal: string;
}

export interface Produccion {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidadPlaneada: number;
  cantidadProducida: number;
  estado: string;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface NuevaProduccion {
  productoId: string;
  cantidadPlaneada: number;
  notas: string | null;
}

export interface AvanceProduccion {
  estado: string;
  cantidadProducida: number;
  notas: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  register(name: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, { name, email, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  getAdminSummary(): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${this.baseUrl}/admin/summary`);
  }

  getMyProfile(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/${id}`);
  }

  updateProfile(id: string, data: { name: string; phone?: string | null }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/users/${id}`, data);
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/users/profile`);
  }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos`);
  }

  crearVenta(items: NuevaVentaItem[]): Observable<Venta> {
    return this.http.post<Venta>(`${this.baseUrl}/ventas`, { items });
  }

  getMisVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.baseUrl}/ventas/mis-ventas`);
  }

  crearProducto(data: GuardarProductoDto): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/productos`, data);
  }

  actualizarProducto(id: string, data: GuardarProductoDto): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/productos/${id}`, data);
  }

  eliminarProducto(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/productos/${id}`);
  }

  getProduccion(): Observable<Produccion[]> {
    return this.http.get<Produccion[]>(`${this.baseUrl}/produccion`);
  }

  crearProduccion(data: NuevaProduccion): Observable<Produccion> {
    return this.http.post<Produccion>(`${this.baseUrl}/produccion`, data);
  }

  actualizarProduccion(id: string, data: AvanceProduccion): Observable<Produccion> {
    return this.http.put<Produccion>(`${this.baseUrl}/produccion/${id}`, data);
  }

  eliminarProduccion(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/produccion/${id}`);
  }

  getResenas(): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.baseUrl}/resenas`);
  }

  crearResena(data: { productoId: string; calificacion: number; comentario: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/resenas`, data);
  }

  getResenasAdmin(): Observable<ResenaAdmin[]> {
    return this.http.get<ResenaAdmin[]>(`${this.baseUrl}/admin/resenas`);
  }

  seguimientoResena(id: string, data: { estado: string; respuesta: string | null }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/admin/resenas/${id}`, data);
  }

  crearCotizacion(data: {
    nombre: string;
    email: string;
    telefono: string;
    tipoPropiedad: string;
    items: { productoId: string; cantidad: number }[];
  }): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`${this.baseUrl}/cotizaciones`, data);
  }

  getCotizacionesAdmin(): Observable<Cotizacion[]> {
    return this.http.get<Cotizacion[]>(`${this.baseUrl}/admin/cotizaciones`);
  }

  enviarContacto(data: { nombre: string; email: string; mensaje: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/contacto`, data);
  }

  getMensajesContacto(): Observable<MensajeContacto[]> {
    return this.http.get<MensajeContacto[]>(`${this.baseUrl}/admin/contacto`);
  }

  atenderMensaje(id: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/admin/contacto/${id}/atendido`, {});
  }

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.baseUrl}/admin/proveedores`);
  }

  crearProveedor(data: GuardarProveedorDto): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.baseUrl}/admin/proveedores`, data);
  }

  actualizarProveedor(id: string, data: GuardarProveedorDto): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/admin/proveedores/${id}`, data);
  }

  eliminarProveedor(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/admin/proveedores/${id}`);
  }

  getMateriasPrimas(): Observable<MateriaPrima[]> {
    return this.http.get<MateriaPrima[]>(`${this.baseUrl}/admin/materias-primas`);
  }

  crearMateriaPrima(data: { nombre: string; unidad: string }): Observable<MateriaPrima> {
    return this.http.post<MateriaPrima>(`${this.baseUrl}/admin/materias-primas`, data);
  }

  actualizarMateriaPrima(id: string, data: { nombre: string; unidad: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/admin/materias-primas/${id}`, data);
  }

  eliminarMateriaPrima(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/admin/materias-primas/${id}`);
  }

  getCompras(): Observable<CompraProveedor[]> {
    return this.http.get<CompraProveedor[]>(`${this.baseUrl}/admin/compras`);
  }

  crearCompra(data: {
    proveedorId: string;
    items: { materiaPrimaId: string; cantidad: number; costoUnitario: number }[];
  }): Observable<CompraProveedor> {
    return this.http.post<CompraProveedor>(`${this.baseUrl}/admin/compras`, data);
  }

  getUsuariosAdmin(page?: number, limit?: number): Observable<{ total: number; page: number; limit: number; data: UsuarioAdmin[] }> {
    return this.http.get<{ total: number; page: number; limit: number; data: UsuarioAdmin[] }>(
      `${this.baseUrl}/admin/users?page=${page ?? 1}&limit=${limit ?? 50}`
    );
  }

  crearUsuarioAdmin(data: { name: string; email: string; role: string }): Observable<UsuarioCreado> {
    return this.http.post<UsuarioCreado>(`${this.baseUrl}/admin/users`, data);
  }

  eliminarUsuarioAdmin(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/admin/users/${id}`);
  }

  cambiarPassword(data: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/users/profile/password`, data);
  }
}
