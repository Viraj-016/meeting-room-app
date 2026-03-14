import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../shared/services/room.service';
import { BookingService } from '../../shared/services/booking.service';
import { RoomDetail, BookingSlot, CreateBooking } from '../../shared/models';

@Component({
  selector: 'app-room-detail',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss'
})
export class RoomDetailComponent implements OnInit {
  room: RoomDetail | null = null;
  loading = true;
  bookingForm: FormGroup;
  submitting = false;
  selectedDateBookings: BookingSlot[] = [];
  minDate = new Date();

  // Time slots for selection
  timeSlots: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private roomService: RoomService,
    private bookingService: BookingService,
    private toastr: ToastrService
  ) {
    this.bookingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [''],
      date: [null, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });

    this.generateTimeSlots();
  }

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.loadRoom(+roomId);
    }
  }

  private generateTimeSlots(): void {
    for (let hour = 7; hour <= 21; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    this.timeSlots.push('22:00');
  }

  private loadRoom(roomId: number): void {
    this.loading = true;
    this.roomService.getRoomById(roomId).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          this.room = result.data;
          this.selectedDateBookings = result.data.todaysBookings || [];
        } else {
          this.toastr.error(result.message || 'Room not found', 'Error');
          this.router.navigate(['/rooms']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.toastr.error('Failed to load room details', 'Error');
        this.loading = false;
        this.router.navigate(['/rooms']);
      }
    });
  }

  onDateChange(): void {
    const selectedDate = this.bookingForm.get('date')?.value;
    if (selectedDate && this.room) {
      this.loadRoomAvailability(selectedDate);
    }
  }

  private loadRoomAvailability(date: Date): void {
    if (!this.room) return;

    this.roomService.getRoomAvailability(this.room.id, date).subscribe({
      next: (availability) => {
        this.selectedDateBookings = availability.bookedSlots || [];
      },
      error: (error) => {
        console.error('Error loading availability:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.room) {
      this.markFormTouched();
      return;
    }

    const formValue = this.bookingForm.value;
    const selectedDate = new Date(formValue.date);

    // Parse start time
    const [startHour, startMin] = formValue.startTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, startMin, 0, 0);

    // Parse end time
    const [endHour, endMin] = formValue.endTime.split(':').map(Number);
    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMin, 0, 0);

    // Validate times
    if (startTime >= endTime) {
      this.toastr.error('End time must be after start time', 'Invalid Time');
      return;
    }

    // Check for conflicts
    if (this.hasTimeConflict(startTime, endTime)) {
      this.toastr.error('Selected time slot conflicts with existing booking', 'Time Conflict');
      return;
    }

    const booking: CreateBooking = {
      roomId: this.room.id,
      title: formValue.title,
      description: formValue.description,
      startTime: startTime,
      endTime: endTime
    };

    this.submitting = true;
    this.bookingService.createBooking(booking).subscribe({
      next: (result) => {
        this.submitting = false;
        if (result.success) {
          this.toastr.success('Room booked successfully!', 'Success');
          this.router.navigate(['/my-bookings']);
        } else {
          this.toastr.error(result.message || 'Failed to book room', 'Error');
        }
      },
      error: (error) => {
        this.submitting = false;
        this.toastr.error(error.error?.message || 'Failed to book room', 'Error');
      }
    });
  }

  private hasTimeConflict(startTime: Date, endTime: Date): boolean {
    return this.selectedDateBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return (startTime < bookingEnd && endTime > bookingStart);
    });
  }

  private markFormTouched(): void {
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.bookingForm.get(key)?.markAsTouched();
    });
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getEndTimeSlots(): string[] {
    const startTime = this.bookingForm.get('startTime')?.value;
    if (!startTime) return this.timeSlots;

    const startIndex = this.timeSlots.indexOf(startTime);
    return this.timeSlots.slice(startIndex + 1);
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }
}
