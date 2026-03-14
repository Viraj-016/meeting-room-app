import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../shared/services/auth.service';
import { BookingService } from '../shared/services/booking.service';
import { SessionUser, Booking } from '../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: SessionUser | null = null;
  upcomingBookings: Booking[] = [];
  todayBookings: Booking[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Load today's bookings
    this.bookingService.getTodayBookings().subscribe({
      next: (bookings) => {
        this.todayBookings = bookings;
      },
      error: (error) => {
        console.error('Error loading today bookings:', error);
      }
    });

    // Load upcoming bookings
    this.bookingService.getUpcomingBookings(7).subscribe({
      next: (bookings) => {
        this.upcomingBookings = bookings.slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading upcoming bookings:', error);
        this.loading = false;
        this.toastr.error('Failed to load bookings', 'Error');
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }
}
