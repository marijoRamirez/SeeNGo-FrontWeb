import { Component, OnInit, Inject, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private api = inject(ApiService);
  protected auth = inject(AuthService);
  @Inject(PLATFORM_ID) private platformId: object = inject(PLATFORM_ID);

  name = '';
  email = '';
  phone = '';

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.api.getMyProfile().subscribe({
        next: (user) => {
          this.name = user.name;
          this.email = user.email;
          this.phone = user.phone || '';
        }
      });
    }
  }
}
