import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../shared/services/auth.service';
import { UserService } from '../shared/services/user.service';
import { User, UpdateUser, ChangePassword } from '../shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  savingProfile = false;
  changingPassword = false;
  editMode = false;

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      department: [''],
      phone: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.user = result.data;
          this.populateForm();
        } else {
          this.toastr.error(result.message || 'Failed to load profile', 'Error');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastr.error('Failed to load profile', 'Error');
        this.loading = false;
      }
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        department: this.user.department || '',
        phone: this.user.phone || ''
      });
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.populateForm(); // Reset form on cancel
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.user) {
      this.markFormTouched(this.profileForm);
      return;
    }

    const updateData: UpdateUser = {
      fullName: this.profileForm.value.fullName,
      email: this.profileForm.value.email,
      department: this.profileForm.value.department || undefined,
      phone: this.profileForm.value.phone || undefined
    };

    this.savingProfile = true;
    this.userService.updateUser(this.user.id, updateData).subscribe({
      next: (result) => {
        this.savingProfile = false;
        if (result.success) {
          this.toastr.success('Profile updated successfully', 'Success');
          this.editMode = false;
          this.loadUserProfile();
        } else {
          this.toastr.error(result.message || 'Failed to update profile', 'Error');
        }
      },
      error: (error) => {
        this.savingProfile = false;
        this.toastr.error(error.error?.message || 'Failed to update profile', 'Error');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.user) {
      this.markFormTouched(this.passwordForm);
      return;
    }

    if (this.passwordForm.hasError('passwordMismatch')) {
      this.toastr.error('Passwords do not match', 'Validation Error');
      return;
    }

    const passwordData: ChangePassword = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.changingPassword = true;
    this.userService.changePassword(this.user.id, passwordData).subscribe({
      next: (result) => {
        this.changingPassword = false;
        if (result.success) {
          this.toastr.success('Password changed successfully', 'Success');
          this.passwordForm.reset();
        } else {
          this.toastr.error(result.message || 'Failed to change password', 'Error');
        }
      },
      error: (error) => {
        this.changingPassword = false;
        this.toastr.error(error.error?.message || 'Failed to change password', 'Error');
      }
    });
  }

  private markFormTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  getInitials(): string {
    if (!this.user?.fullName) return 'U';
    const names = this.user.fullName.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return names[0][0];
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
