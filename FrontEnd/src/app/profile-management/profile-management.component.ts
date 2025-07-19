import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-profile-management',
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.scss'],
})
export class ProfileManagementComponent implements OnInit {
  activeTab: string = 'profile';
  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  securityForm!: FormGroup;
  twoFactorEnabled: boolean = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
  }

  initializeForms(): void {
    // Profile Form
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      department: [''],
      role: [''],
    });

    // Preferences Form
    this.preferencesForm = this.formBuilder.group({
      language: ['en'],
      timezone: ['UTC-5'],
      dateFormat: ['MM/DD/YYYY'],
      theme: ['light'],
      emailNotifications: [true],
      pushNotifications: [false],
      weeklyReports: [true],
    });

    // Security Form
    this.securityForm = this.formBuilder.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  loadUserData(): void {
    // Simulate loading user data
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phoneNumber: '+1 (555) 123-4567',
      department: 'analytics',
      role: 'Senior Analyst',
    };

    this.profileForm.patchValue(userData);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onSaveProfile(): void {
    if (this.profileForm.valid) {
      console.log('Profile updated:', this.profileForm.value);
      // Implement save profile logic
      this.showSuccessMessage('Profile updated successfully!');
    }
  }

  onSavePreferences(): void {
    console.log('Preferences updated:', this.preferencesForm.value);
    // Implement save preferences logic
    this.showSuccessMessage('Preferences updated successfully!');
  }

  onChangePassword(): void {
    if (this.securityForm.valid) {
      console.log('Password change requested');
      // Implement password change logic
      this.showSuccessMessage('Password changed successfully!');
      this.securityForm.reset();
    }
  }

  onToggleTwoFactor(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.twoFactorEnabled = target.checked;
    console.log(
      'Two-factor authentication:',
      this.twoFactorEnabled ? 'enabled' : 'disabled'
    );
    // Implement 2FA toggle logic
  }

  onDeactivateAccount(): void {
    if (confirm('Are you sure you want to deactivate your account?')) {
      console.log('Account deactivation requested');
      // Implement account deactivation logic
    }
  }

  onDeleteAccount(): void {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation === 'DELETE') {
      console.log('Account deletion requested');
      // Implement account deletion logic
    }
  }

  onCancel(): void {
    // Reset forms to initial state
    this.loadUserData();
    this.securityForm.reset();
  }

  private showSuccessMessage(message: string): void {
    // Implement toast/notification service
    console.log(message);
  }
}
