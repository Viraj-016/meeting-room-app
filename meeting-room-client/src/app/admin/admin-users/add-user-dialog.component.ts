import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../shared/services/user.service';
import { CreateUser } from '../../shared/models';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Add New User</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Enter username">
            <mat-error *ngIf="userForm.get('username')?.hasError('required')">Username is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName" placeholder="Enter full name">
            <mat-error *ngIf="userForm.get('fullName')?.hasError('required')">Full name is required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Enter email">
            <mat-error *ngIf="userForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="userForm.get('email')?.hasError('email')">Invalid email format</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Enter password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="userForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select formControlName="department">
              <mat-option value="">Select department</mat-option>
              <mat-option *ngFor="let dept of departments" [value]="dept">{{ dept }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" placeholder="Enter phone number">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="User">User</mat-option>
            <mat-option value="Admin">Admin</mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('role')?.hasError('required')">Role is required</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading || userForm.invalid">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Create User</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      min-width: 500px;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .full-width {
      width: 100%;
    }
    mat-dialog-content {
      padding-top: 1rem;
    }
    mat-dialog-actions {
      padding: 1rem 0;
    }
    @media (max-width: 600px) {
      .user-form {
        min-width: auto;
      }
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class AddUserDialogComponent {
  userForm: FormGroup;
  loading = false;
  hidePassword = true;
  departments = ['IT', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private userService: UserService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      department: [''],
      phone: [''],
      role: ['User', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.loading = true;
    const userData: CreateUser = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.toastr.success('User created successfully!', 'Success');
          this.dialogRef.close(true);
        } else {
          this.toastr.error(response.message || 'Failed to create user', 'Error');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(error.error?.message || 'Failed to create user', 'Error');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
