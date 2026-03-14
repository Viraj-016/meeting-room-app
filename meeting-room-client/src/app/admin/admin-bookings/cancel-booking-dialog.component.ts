import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Booking } from '../../shared/models';

@Component({
  selector: 'app-cancel-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>warning</mat-icon>
      Cancel Booking
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to cancel this booking?</p>
      <div class="booking-info">
        <strong>{{ data.booking.title }}</strong>
        <span>{{ data.booking.roomName }}</span>
        <span>{{ formatDateTime(data.booking.startTime) }}</span>
      </div>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Cancellation Reason</mat-label>
        <textarea matInput [(ngModel)]="cancelReason" rows="3" placeholder="Enter reason for cancellation..."></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" (click)="confirm()" [disabled]="!cancelReason.trim()">
        <mat-icon>cancel</mat-icon>
        Confirm Cancellation
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;

      mat-icon {
        color: #d32f2f;
      }
    }

    .booking-info {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      strong {
        font-size: 16px;
      }

      span {
        color: #666;
        font-size: 14px;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 0 0;
      gap: 8px;
    }
  `]
})
export class CancelBookingDialogComponent {
  cancelReason = '';

  constructor(
    public dialogRef: MatDialogRef<CancelBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { booking: Booking }
  ) {}

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

  confirm(): void {
    if (this.cancelReason.trim()) {
      this.dialogRef.close(this.cancelReason.trim());
    }
  }
}
