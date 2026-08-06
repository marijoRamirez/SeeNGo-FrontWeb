import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService, MensajeContacto, ResenaAdmin } from '../../core/services/api';

type Pestana = 'resenas' | 'mensajes';

@Component({
  selector: 'app-admin-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.html',
  styleUrl: './comments.scss',
})
export class Comments implements OnInit {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  protected readonly skeletons = [0, 1];
  protected readonly estrellas = [1, 2, 3, 4, 5];

  readonly pestana = signal<Pestana>('resenas');
  readonly resenas = signal<ResenaAdmin[]>([]);
  readonly mensajes = signal<MensajeContacto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly errorAccion = signal<string | null>(null);
  readonly actualizandoId = signal<string | null>(null);

  respuestas: Record<string, string> = {};

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      resenas: this.api.getResenasAdmin(),
      mensajes: this.api.getMensajesContacto(),
    }).subscribe({
      next: ({ resenas, mensajes }) => {
        this.resenas.set(resenas);
        this.mensajes.set(mensajes);
        for (const resena of resenas) {
          this.respuestas[resena.id] = resena.respuesta ?? '';
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los comentarios. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  guardarSeguimiento(resena: ResenaAdmin, estado: string) {
    this.actualizandoId.set(resena.id);
    this.errorAccion.set(null);

    const respuesta = this.respuestas[resena.id]?.trim() || null;

    this.api.seguimientoResena(resena.id, { estado, respuesta }).subscribe({
      next: () => {
        this.resenas.update(resenas =>
          resenas.map(r => (r.id === resena.id ? { ...r, estado, respuesta } : r))
        );
        this.actualizandoId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.actualizandoId.set(null);
        this.errorAccion.set(err.error?.message ?? 'No se pudo actualizar el seguimiento.');
      },
    });
  }

  atenderMensaje(mensaje: MensajeContacto) {
    this.actualizandoId.set(mensaje.id);
    this.errorAccion.set(null);

    this.api.atenderMensaje(mensaje.id).subscribe({
      next: () => {
        this.mensajes.update(mensajes =>
          mensajes.map(m => (m.id === mensaje.id ? { ...m, atendido: true } : m))
        );
        this.actualizandoId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.actualizandoId.set(null);
        this.errorAccion.set(err.error?.message ?? 'No se pudo marcar el mensaje.');
      },
    });
  }

  pendientesResenas(): number {
    return this.resenas().filter(r => r.estado === 'pendiente').length;
  }

  pendientesMensajes(): number {
    return this.mensajes().filter(m => !m.atendido).length;
  }
}
