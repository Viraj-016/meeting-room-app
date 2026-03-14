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
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../shared/services/room.service';
import { RoomDetail, CreateRoom, UpdateRoom } from '../../shared/models';

@Component({
  selector: 'app-room-form',
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
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './room-form.component.html',
  styleUrl: './room-form.component.scss'
})
export class RoomFormComponent implements OnInit {
  roomForm!: FormGroup;
  isEditMode = false;
  roomId: number | null = null;
  loading = false;
  saving = false;
  amenities: string[] = [];
  availableAmenities: string[] = [];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableAmenities();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.roomId = +params['id'];
        this.loadRoom(this.roomId);
      }
    });
  }

  private initForm(): void {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      capacity: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      location: ['', Validators.maxLength(200)],
      description: ['', Validators.maxLength(500)],
      imageUrl: ['', Validators.maxLength(500)]
    });
  }

  private loadRoom(id: number): void {
    this.loading = true;
    this.roomService.getRoomById(id).subscribe({
      next: (result) => {
        if (result.success && result.data) {
          const room = result.data;
          this.roomForm.patchValue({
            name: room.name,
            capacity: room.capacity,
            location: room.location || '',
            description: room.description || '',
            imageUrl: room.imageUrl || ''
          });
          this.amenities = [...room.amenities];
        } else {
          this.toastr.error('Room not found', 'Error');
          this.router.navigate(['/admin/rooms']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.toastr.error('Failed to load room', 'Error');
        this.loading = false;
        this.router.navigate(['/admin/rooms']);
      }
    });
  }

  private loadAvailableAmenities(): void {
    this.roomService.getAmenities().subscribe({
      next: (amenities) => {
        this.availableAmenities = amenities;
      },
      error: (error) => {
        console.error('Error loading amenities:', error);
        // Default amenities if API fails
        this.availableAmenities = [
          'Projector', 'Whiteboard', 'Video Conference', 'TV Screen',
          'Air Conditioning', 'WiFi', 'Phone', 'Webcam', 'Microphone'
        ];
      }
    });
  }

  addAmenity(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && !this.amenities.includes(value)) {
      this.amenities.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeAmenity(amenity: string): void {
    const index = this.amenities.indexOf(amenity);
    if (index >= 0) {
      this.amenities.splice(index, 1);
    }
  }

  selectAmenity(amenity: string): void {
    if (!this.amenities.includes(amenity)) {
      this.amenities.push(amenity);
    }
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.toastr.warning('Please fix the form errors', 'Validation Error');
      return;
    }

    this.saving = true;

    const formValue = this.roomForm.value;

    if (this.isEditMode && this.roomId) {
      const updateData: UpdateRoom = {
        name: formValue.name,
        capacity: formValue.capacity,
        location: formValue.location || undefined,
        description: formValue.description || undefined,
        imageUrl: formValue.imageUrl || undefined,
        amenities: this.amenities
      };

      this.roomService.updateRoom(this.roomId, updateData).subscribe({
        next: (result) => {
          if (result.success) {
            this.toastr.success('Room updated successfully', 'Success');
            this.router.navigate(['/admin/rooms']);
          } else {
            this.toastr.error(result.message, 'Error');
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error updating room:', error);
          this.toastr.error('Failed to update room', 'Error');
          this.saving = false;
        }
      });
    } else {
      const createData: CreateRoom = {
        name: formValue.name,
        capacity: formValue.capacity,
        location: formValue.location || undefined,
        description: formValue.description || undefined,
        imageUrl: formValue.imageUrl || undefined,
        amenities: this.amenities
      };

      this.roomService.createRoom(createData).subscribe({
        next: (result) => {
          if (result.success) {
            this.toastr.success('Room created successfully', 'Success');
            this.router.navigate(['/admin/rooms']);
          } else {
            this.toastr.error(result.message, 'Error');
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating room:', error);
          this.toastr.error('Failed to create room', 'Error');
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/rooms']);
  }

  getErrorMessage(field: string): string {
    const control = this.roomForm.get(field);
    if (control?.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (control?.hasError('min')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${control.errors?.['max'].max}`;
    }
    if (control?.hasError('maxlength')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    return '';
  }
}
