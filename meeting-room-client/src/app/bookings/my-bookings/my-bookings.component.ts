import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../shared/services/booking.service';
import { Booking } from '../../shared/models';
import { CancelDialogComponent } from './cancel-dialog.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CancelDialogComponent
  ],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.scss'
})
export class MyBookingsComponent implements OnInit {
  upcomingBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  cancelledBookings: Booking[] = [];
  loading = true;
  activeTab = 0;

  constructor(
    private bookingService: BookingService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;

    // Load upcoming (Confirmed status)
    this.bookingService.getMyBookings('Confirmed').subscribe({
      next: (bookings) => {
        const now = new Date();
        this.upcomingBookings = bookings.filter(b => new Date(b.startTime) > now);
      },
      error: (error) => {
        console.error('Error loading upcoming bookings:', error);
      }
    });

    // Load completed (past)
    this.bookingService.getMyBookings('Completed').subscribe({
      next: (bookings) => {
        this.pastBookings = bookings;
      },
      error: (error) => {
        console.error('Error loading past bookings:', error);
      }
    });

    // Load cancelled
    this.bookingService.getMyBookings('Cancelled').subscribe({
      next: (bookings) => {
        this.cancelledBookings = bookings;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cancelled bookings:', error);
        this.loading = false;
      }
    });
  }

  onTabChange(index: number): void {
    this.activeTab = index;
  }

  openCancelDialog(booking: Booking): void {
    const dialogRef = this.dialog.open(CancelDialogComponent, {
      width: '400px',
      data: { booking }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cancelBooking(booking.id, result.reason);
      }
    });
  }

  private cancelBooking(bookingId: number, reason: string): void {
    this.bookingService.cancelBooking(bookingId, { cancelReason: reason }).subscribe({
      next: (result) => {
        if (result.success) {
          this.toastr.success('Booking cancelled successfully', 'Success');
          this.loadBookings();
        } else {
          this.toastr.error(result.message || 'Failed to cancel booking', 'Error');
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to cancel booking', 'Error');
      }
    });
  }

  canCancel(booking: Booking): boolean {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    return booking.status === 'Confirmed' && startTime > now;
  }

  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  getDuration(booking: Booking): string {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  }
}
