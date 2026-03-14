import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { RoomService } from '../../shared/services/room.service';
import { Room, PagedResult } from '../../shared/models';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  totalRooms = 0;
  pageSize = 12;
  currentPage = 1;

  // Filters
  searchTerm = '';
  selectedCapacity: number | null = null;
  selectedLocation: string | null = null;

  // Filter options
  capacityOptions = [2, 4, 6, 8, 10, 15, 20, 30, 50];
  locations: string[] = [];

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
      this.selectedCapacity || undefined,
      this.selectedLocation || undefined
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
    // Load all rooms briefly to extract unique locations
    this.roomService.getRooms(1, 100).subscribe({
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
    this.selectedCapacity = null;
    this.selectedLocation = null;
    this.currentPage = 1;
    this.loadRooms();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRooms();
  }

  viewRoomDetail(room: Room): void {
    this.router.navigate(['/rooms', room.id]);
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
    return !!(this.searchTerm || this.selectedCapacity || this.selectedLocation);
  }
}
