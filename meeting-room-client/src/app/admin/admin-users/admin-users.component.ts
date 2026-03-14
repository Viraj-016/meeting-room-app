import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../shared/services/user.service';
import { User, PagedResult } from '../../shared/models';
import { AddUserDialogComponent } from './add-user-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  totalUsers = 0;
  pageSize = 10;
  currentPage = 1;

  // Filters
  searchTerm = '';
  selectedDepartment: string | null = null;
  selectedRole: string | null = null;
  selectedStatus: boolean | null = null;

  // Filter options
  departments: string[] = [];
  roles: string[] = ['Admin', 'User'];
  statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  displayedColumns: string[] = ['fullName', 'username', 'email', 'department', 'role', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadDepartments();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers(
      this.currentPage,
      this.pageSize,
      this.searchTerm || undefined,
      this.selectedDepartment || undefined,
      this.selectedRole || undefined,
      this.selectedStatus !== null ? this.selectedStatus : undefined
    ).subscribe({
      next: (result: PagedResult<User>) => {
        this.users = result.data;
        this.totalUsers = result.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastr.error('Failed to load users', 'Error');
        this.loading = false;
      }
    });
  }

  private loadDepartments(): void {
    this.userService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = null;
    this.selectedRole = null;
    this.selectedStatus = null;
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  toggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (result) => {
        if (result.success) {
          user.isActive = !user.isActive;
          this.toastr.success(`User ${user.isActive ? 'activated' : 'deactivated'} successfully`, 'Success');
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

  viewUserDetail(user: User): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedDepartment || this.selectedRole || this.selectedStatus !== null);
  }

  getRoleClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'user': return 'role-user';
      default: return '';
    }
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }
}
