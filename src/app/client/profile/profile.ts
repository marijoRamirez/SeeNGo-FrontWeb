import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private api = inject(ApiService);
  private plataformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  protected auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  name: string = '';
  email: string = '';
  phone: string | null = null;
  role: string = '';
  createdAt: string = '';
  isLoading: boolean = true;
  errorMessage: string | null = null;

  isEditing = false;
  successMessage: string | null = null;
  isSaving = false;

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    phone: new FormControl(''),
    email: new FormControl({ value: '', disabled: true })
  });

  showDeleteConfirm = false;
  isDeleting = false;

  private userId: string | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.auth.user$.pipe(take(1)).subscribe(user => {
        if (user?.id) {
          this.userId = user.id;
          this.loadProfile();
        } else {
          this.isLoading = false;
          this.errorMessage = 'No se encontró información de usuario.';
        }
      });
    }
  }

  private loadProfile() {
    if (!this.userId) return;
    this.api.getMyProfile(this.userId).subscribe({
      next: (user) => {
        this.name = user.name;
        this.email = user.email;
        this.phone = user.phone || null;
        this.role = user.role;
        this.createdAt = user.createdAt;
        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Tu sesión ha expirado.';
        } else if (error.status === 404) {
          this.errorMessage = 'Usuario no encontrado.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado al cargar tu perfil.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.successMessage = null;
    this.errorMessage = null;
    if (this.isEditing) {
      this.editForm.patchValue({
        name: this.name,
        phone: this.phone || ''
      });
    }
  }

  saveProfile() {
    if (this.editForm.invalid || !this.userId) return;
    this.isSaving = true;
    this.successMessage = null;
    this.errorMessage = null;

    const { name, phone } = this.editForm.value;
    this.api.updateProfile(this.userId, { name: name!, phone: phone || null }).subscribe({
      next: () => {
        this.name = name!;
        this.phone = phone || null;
        this.isSaving = false;
        this.isEditing = false;
        this.successMessage = 'Perfil actualizado correctamente.';
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.status === 404
          ? 'Usuario no encontrado.'
          : 'Ocurrió un error al actualizar el perfil.';
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.errorMessage = null;
  }

  requestDeleteConfirmation() {
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  confirmDelete() {
    if (!this.userId) return;
    this.isDeleting = true;
    this.errorMessage = null;

    this.api.deleteAccount(this.userId).subscribe({
      next: () => {
        this.auth.logout();
      },
      error: () => {
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.errorMessage = 'Ocurrió un error al eliminar la cuenta. Intenta de nuevo.';
      }
    });
  }
}
