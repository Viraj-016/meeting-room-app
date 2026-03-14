import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../shared/services/user.service';
import { UserDetail, User, UpdateUser, Booking, PagedResult } from '../../shared/models';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './admin-user-detail.component.html',
  styleUrl: './admin-user-detail.component.scss'
})
export class AdminUserDetailComponent implements OnInit {
  userId: number | null = null;
  user: UserDetail | null = null;
  loading = true;
  editing = false;
  saving = false;

  editForm!: FormGroup;

  // Bookings
  bookings: Booking[] = [];
  bookingsLoading = false;
  totalBookings = 0;
  bookingsPageSize = 10;
  bookingsCurrentPage = 1;
  displayedColumns: string[] = ['room', 'title', 'date', 'time', 'status'];

  // Stats
  bookingStats = {
    total: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  };

  // Filter options
  departments: string[] = [];
  roles: string[] = ['Admin', 'User'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.loadUser(this.userId);
        this.loadUserBookings();
      }
    });
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      department: [''],
      phone: ['', Validators.maxLength(20)],
      role: ['', Validators.required]
    });
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.user = result.data;
          this.populateForm();
          this.calculateBookingStats();
        } else {
          this.toastr.error('User not found', 'Error');
          this.router.navigate(['/admin/users']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.toastr.error('Failed to load user', 'Error');
        this.loading = false;
        this.router.navigate(['/admin/users']);
      }
    });
  }

  private loadDepartments(): void {
    this.userService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      }
    });
  }

  private loadUserBookings(): void {
    if (!this.userId) return;

    this.bookingsLoading = true;
    this.userService.getUserBookings(
      this.userId,
      this.bookingsCurrentPage,
      this.bookingsPageSize
    ).subscribe({
      next: (result: PagedResult<Booking>) => {
        this.bookings = result.data;
        this.totalBookings = result.total;
        this.bookingsLoading = false;
      },
      error: (error) => {
        console.error('Error loading user bookings:', error);
        this.bookingsLoading = false;
      }
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.editForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        department: this.user.department || '',
        phone: this.user.phone || '',
        role: this.user.role
      });
    }
  }

  private calculateBookingStats(): void {
    if (this.user && this.user.recentBookings) {
      this.bookingStats.total = this.user.bookingCount;
      this.bookingStats.confirmed = this.user.recentBookings.filter(b => b.status.toLowerCase() === 'confirmed').length;
      this.bookingStats.cancelled = this.user.recentBookings.filter(b => b.status.toLowerCase() === 'cancelled').length;
      this.bookingStats.completed = this.user.recentBookings.filter(b => b.status.toLowerCase() === 'completed').length;
    }
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    if (!this.editing) {
      this.populateForm();
    }
  }

  saveUser(): void {
    if (this.editForm.invalid || !this.userId) return;

    this.saving = true;
    const formValue = this.editForm.value;
    const updateData: UpdateUser = {
      fullName: formValue.fullName,
      email: formValue.email,
      department: formValue.department || undefined,
      phone: formValue.phone || undefined,
      role: formValue.role
    };

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.toastr.success('User updated successfully', 'Success');
          if (this.user) {
            this.user.fullName = result.data.fullName;
            this.user.email = result.data.email;
            this.user.department = result.data.department;
            this.user.phone = result.data.phone;
            this.user.role = result.data.role;
          }
          this.editing = false;
        } else {
          this.toastr.error(result.message, 'Error');
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.toastr.error('Failed to update user', 'Error');
        this.saving = false;
      }
    });
  }

  toggleUserStatus(): void {
    if (!this.userId || !this.user) return;

    this.userService.toggleUserStatus(this.userId).subscribe({
      next: (result) => {
        if (result.success && this.user) {
          this.user.isActive = !this.user.isActive;
          this.toastr.success(`User ${this.user.isActive ? 'activated' : 'deactivated'} successfully`, 'Success');
        } else {
          this.toastr.error(result.message, 'Error');
        }
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.toastr.error('Failed to update user status', 'Error');
      }
    });
  }

  onBookingsPageChange(event: PageEvent): void {
    this.bookingsCurrentPage = event.pageIndex + 1;
    this.bookingsPageSize = event.pageSize;
    this.loadUserBookings();
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'user': return 'role-user';
      default: return '';
    }
  }
}
