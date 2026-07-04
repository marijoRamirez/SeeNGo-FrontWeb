import { Component, OnInit, Inject, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);
  @Inject(PLATFORM_ID) private platformId: object = inject(PLATFORM_ID);

  usuariosActivos = 0;
  dispositivosRegistrados = 0;
  alertasPendientes = 0;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.api.getAdminSummary().subscribe({
        next: (res) => {
          this.usuariosActivos = res.usuariosActivos;
          this.dispositivosRegistrados = res.dispositivosRegistrados;
          this.alertasPendientes = res.alertasPendientes;
        }
      });
    }
  }
}
