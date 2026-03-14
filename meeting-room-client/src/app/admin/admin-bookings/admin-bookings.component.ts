import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../shared/services/booking.service';
import { RoomService } from '../../shared/services/room.service';
import { Booking, BookingFilter, PagedResult, Room } from '../../shared/models';
import { CancelBookingDialogComponent } from './cancel-booking-dialog.component';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './admin-bookings.component.html',
  styleUrl: './admin-bookings.component.scss'
})
export class AdminBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  totalBookings = 0;
  pageSize = 10;
  currentPage = 1;

  // Filters
  searchTerm = '';
  selectedRoomId: number | null = null;
  selectedStatus: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Filter options
  rooms: Room[] = [];
  statuses: string[] = ['Confirmed', 'Cancelled', 'Completed', 'Pending'];

  displayedColumns: string[] = ['room', 'bookedBy', 'department', 'title', 'date', 'time', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadRooms();
  }

  loadBookings(): void {
    this.loading = true;
    const filter: BookingFilter = {
      page: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      roomId: this.selectedRoomId || undefined,
      status: this.selectedStatus || undefined,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined
    };

    this.bookingService.getAllBookings(filter).subscribe({
      next: (result: PagedResult<Booking>) => {
        this.bookings = result.data;
        this.totalBookings = result.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.toastr.error('Failed to load bookings', 'Error');
        this.loading = false;
      }
    });
  }

  private loadRooms(): void {
    this.roomService.getRooms(1, 100, undefined, undefined, undefined, undefined, true).subscribe({
      next: (result: PagedResult<Room>) => {
        this.rooms = result.data;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.loadBookings();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRoomId = null;
    this.selectedStatus = null;
    this.startDate = null;
    this.endDate = null;
    this.currentPage = 1;
    this.loadBookings();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadBookings();
  }

  cancelBooking(booking: Booking): void {
    const dialogRef = this.dialog.open(CancelBookingDialogComponent, {
      width: '400px',
      data: { booking }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookingService.cancelBooking(booking.id, { cancelReason: result }).subscribe({
          next: (response) => {
            if (response.success) {
              booking.status = 'Cancelled';
              booking.cancelReason = result;
              this.toastr.success('Booking cancelled successfully', 'Success');
            } else {
              this.toastr.error(response.message, 'Error');
            }
          },
          error: (error) => {
            console.error('Error cancelling booking:', error);
            this.toastr.error('Failed to cancel booking', 'Error');
          }
        });
      }
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedRoomId || this.selectedStatus || this.startDate || this.endDate);
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

  canCancel(booking: Booking): boolean {
    return booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase() === 'pending';
  }
}
