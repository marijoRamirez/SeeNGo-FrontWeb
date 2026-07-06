import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordsMatch });

  errorMessage = '';
  successMessage = '';

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { mismatch: true } : null;
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    const { name, email, password } = this.registerForm.value;
    this.errorMessage = '';
    this.successMessage = '';
    this.auth.register(name!, email!, password!).subscribe({
      next: () => {
        this.successMessage = 'Cuenta creada exitosamente. Redirigiendo al inicio de sesión...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.status === 409
          ? 'El correo ya está registrado.'
          : 'Ocurrió un error al crear la cuenta. Intenta de nuevo.';
      }
    });
  }
}
