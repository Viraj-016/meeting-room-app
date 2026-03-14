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
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../shared/services/room.service';
import { Room, PagedResult } from '../../shared/models';

@Component({
  selector: 'app-admin-rooms',
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
    MatTooltipModule
  ],
  templateUrl: './admin-rooms.component.html',
  styleUrl: './admin-rooms.component.scss'
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  totalRooms = 0;
  pageSize = 10;
  currentPage = 1;

  // Filters
  searchTerm = '';
  selectedLocation: string | null = null;

  // Filter options
  locations: string[] = [];

  displayedColumns: string[] = ['name', 'capacity', 'location', 'amenities', 'status', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private roomService: RoomService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.extractLocations();
  }

  loadRooms(): void {
    this.loading = true;
    this.roomService.getRooms(
      this.currentPage,
      this.pageSize,
      this.searchTerm || undefined,
      undefined,
      this.selectedLocation || undefined,
      undefined,
      true // Include inactive rooms for admin view
    ).subscribe({
      next: (result: PagedResult<Room>) => {
        this.rooms = result.data;
        this.totalRooms = result.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.toastr.error('Failed to load rooms', 'Error');
        this.loading = false;
      }
    });
  }

  private extractLocations(): void {
    this.roomService.getRooms(1, 100, undefined, undefined, undefined, undefined, true).subscribe({
      next: (result: PagedResult<Room>) => {
        const locationSet = new Set<string>();
        result.data.forEach(room => {
          if (room.location) {
            locationSet.add(room.location);
          }
        });
        this.locations = Array.from(locationSet).sort();
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRooms();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRooms();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLocation = null;
    this.currentPage = 1;
    this.loadRooms();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRooms();
  }

  toggleRoomStatus(room: Room): void {
    this.roomService.toggleRoomStatus(room.id).subscribe({
      next: (result) => {
        if (result.success) {
          room.isActive = !room.isActive;
          this.toastr.success(`Room ${room.isActive ? 'activated' : 'deactivated'} successfully`, 'Success');
        } else {
          this.toastr.error(result.message, 'Error');
        }
      },
      error: (error) => {
        console.error('Error toggling room status:', error);
        this.toastr.error('Failed to update room status', 'Error');
      }
    });
  }

  editRoom(room: Room): void {
    this.router.navigate(['/admin/rooms', room.id, 'edit']);
  }

  addNewRoom(): void {
    this.router.navigate(['/admin/rooms/new']);
  }

  getAmenitiesPreview(amenities: string[]): string[] {
    return amenities.slice(0, 3);
  }

  hasMoreAmenities(amenities: string[]): boolean {
    return amenities.length > 3;
  }

  getMoreAmenitiesCount(amenities: string[]): number {
    return amenities.length - 3;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedLocation);
  }
}
