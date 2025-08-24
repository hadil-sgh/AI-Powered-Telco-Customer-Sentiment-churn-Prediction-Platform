import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { ChangePasswordRequest } from '../models/change-password-request';
import { UpdateUserRequest } from '../models/update-user-request';
import { User } from '../models/user';

@Component({
  selector: 'app-profile-management',
  templateUrl: './profile-management.component.html',
  styleUrls: ['./profile-management.component.scss'],
})
export class ProfileManagementComponent implements OnInit {
  activeTab: string = 'profile';
  profileForm!: FormGroup;
  securityForm!: FormGroup;
  twoFactorEnabled: boolean = false;
  isChangingPassword: boolean = false;
  changePasswordError: string = '';
  changePasswordSuccess: string = '';
  isUpdatingProfile: boolean = false;
  updateProfileError: string = '';
  updateProfileSuccess: string = '';
  currentUser: User | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
  }

  initializeForms(): void {
    // Profile Form
    this.profileForm = this.formBuilder.group({
      firstName: [{ value: '', disabled: true }], // Read-only as backend doesn't support updating
      lastName: [{ value: '', disabled: true }], // Read-only as backend doesn't support updating
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: [''],
      phoneNumber: ['', [Validators.pattern(/^\d+$/)]], // Only digits allowed
      role: [{ value: '', disabled: true }], // Role cannot be updated according to requirement
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
    // Get email from token
    const userEmail = this.tokenService.getEmailFromToken();

    if (userEmail) {
      // Fetch user details from backend
      this.userService.getUserByEmail(userEmail).subscribe({
        next: (user: User) => {
          this.currentUser = user;

          // Format date of birth for input field
          let formattedDateOfBirth = '';
          if (user.dateOfBirth) {
            // Convert date to YYYY-MM-DD format for input type="date"
            const date = new Date(user.dateOfBirth);
            formattedDateOfBirth = date.toISOString().split('T')[0];
          }

          const userData = {
            firstName: user.firstname || '',
            lastName: user.lastname || '',
            email: user.email || '',
            dateOfBirth: formattedDateOfBirth,
            phoneNumber: user.phoneNumber || '',
            role: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
          };

          this.profileForm.patchValue(userData);
          
          // Enable only the fields that can be updated
          this.profileForm.get('firstName')?.disable();
          this.profileForm.get('lastName')?.disable();
          this.profileForm.get('role')?.disable();
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          // Fallback to token data
          const fullName = this.tokenService.getFullNameFromToken();
          const nameParts = fullName ? fullName.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName =
            nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          const userData = {
            firstName: firstName,
            lastName: lastName,
            email: userEmail,
            dateOfBirth: '',
            phoneNumber: '',
            role: '',
          };

          this.profileForm.patchValue(userData);
          
          // Enable only the fields that can be updated
          this.profileForm.get('firstName')?.disable();
          this.profileForm.get('lastName')?.disable();
          this.profileForm.get('role')?.disable();
        },
      });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onSaveProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isUpdatingProfile = true;
      this.updateProfileError = '';
      this.updateProfileSuccess = '';

      // Get form values
      const newEmail = this.profileForm.get('email')?.value;
      const phoneNumber = this.profileForm.get('phoneNumber')?.value || 0; // Default to 0 if not provided
      const dateOfBirth = this.profileForm.get('dateOfBirth')?.value || '';

      this.userService.updateUser(newEmail, phoneNumber, dateOfBirth).subscribe({
        next: (updatedUser: User) => {
          this.isUpdatingProfile = false;
          this.updateProfileSuccess = 'Profile updated successfully!';
          this.currentUser = updatedUser;

          // Update the form with the returned user data
          this.loadUserData();

          // Clear success message after 5 seconds
          setTimeout(() => {
            this.updateProfileSuccess = '';
          }, 5000);
        },
        error: (error) => {
          this.isUpdatingProfile = false;
          this.updateProfileError =
            error.error?.message ||
            'Failed to update profile. Please try again.';
        },
      });
    }
  }

  onChangePassword(): void {
    if (this.securityForm.valid) {
      this.isChangingPassword = true;
      this.changePasswordError = '';
      this.changePasswordSuccess = '';

      const email = this.tokenService.getEmailFromToken();
      const changePasswordRequest: ChangePasswordRequest = {
        email: email,
        oldPassword: this.securityForm.get('currentPassword')?.value,
        newPassword: this.securityForm.get('newPassword')?.value,
      };

      this.authService.changePassword(changePasswordRequest).subscribe({
        next: (response) => {
          this.isChangingPassword = false;
          this.changePasswordSuccess = 'Password changed successfully!';
          this.securityForm.reset();
        },
        error: (error) => {
          this.isChangingPassword = false;
          this.changePasswordError =
            error.error || 'Failed to change password. Please try again.';
        },
      });
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
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.updateProfileError = '';
    this.updateProfileSuccess = '';
  }

  private showSuccessMessage(message: string): void {
    // Implement toast/notification service
    console.log(message);
  }
}
