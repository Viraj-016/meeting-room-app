import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Booking } from '../../shared/models';

export interface CancelDialogData {
  booking: Booking;
}

@Component({
  selector: 'app-cancel-dialog',
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
      <mat-icon color="warn">warning</mat-icon>
      Cancel Booking
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to cancel this booking?</p>
      <div class="booking-info">
        <strong>{{ data.booking.title }}</strong>
        <p>{{ data.booking.roomName }} - {{ formatDateTime(data.booking.startTime) }}</p>
      </div>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Cancellation Reason</mat-label>
        <textarea matInput
                  [(ngModel)]="cancelReason"
                  placeholder="Please provide a reason for cancellation"
                  rows="3"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Keep Booking</button>
      <button mat-raised-button
              color="warn"
              [disabled]="!cancelReason.trim()"
              (click)="onConfirm()">
        Cancel Booking
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    mat-dialog-content {
      min-width: 300px;
    }

    .booking-info {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;

      strong {
        display: block;
        margin-bottom: 4px;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }
  `]
})
export class CancelDialogComponent {
  cancelReason = '';

  constructor(
    public dialogRef: MatDialogRef<CancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CancelDialogData
  ) {}

  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.cancelReason.trim()) {
      this.dialogRef.close({ reason: this.cancelReason.trim() });
    }
  }
}
