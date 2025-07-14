import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  RegisterForm!: FormGroup;
  showPassword = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    
  }
  ngOnInit(): void {
      this.RegisterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Form submitted:', this.RegisterForm.value);
    if (this.RegisterForm.valid) {
      this.isSubmitting = true;
      console.log('Form is valid. Submitting registration...');
      this.authService.register(this.RegisterForm.value).subscribe({
        next: (res) => {
          console.log('Registration successful:', res);
          this.router.navigate(['/validation']);
        },
        error: (err) => {
          console.error('Registration failed', err);
          this.isSubmitting = false;
        }
      });
    } else {
      console.warn('Form is invalid:', this.RegisterForm.errors, this.RegisterForm.value);
    }
  }
}
