import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService.authenticate(this.loginForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        Swal.fire({
          icon: 'success',
          title: 'Login successful!',
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate(['/Agent']);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: err?.error?.message || 'Invalid email or password',
        });
        this.isSubmitting = false;
      }
    });
  }
}
