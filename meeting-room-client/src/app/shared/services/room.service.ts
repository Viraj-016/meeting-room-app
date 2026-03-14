import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomDetail, CreateRoom, UpdateRoom, PagedResult, Result, BookingSlot, RoomAvailability, ApiResult } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  getRooms(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    minCapacity?: number,
    location?: string,
    amenity?: string,
    includeInactive: boolean = false
  ): Observable<PagedResult<Room>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('includeInactive', includeInactive.toString());

    if (search) params = params.set('search', search);
    if (minCapacity) params = params.set('minCapacity', minCapacity.toString());
    if (location) params = params.set('location', location);
    if (amenity) params = params.set('amenity', amenity);

    return this.http.get<PagedResult<Room>>(this.apiUrl, { params });
  }

  getRoomById(id: number): Observable<Result<RoomDetail>> {
    return this.http.get<Result<RoomDetail>>(`${this.apiUrl}/${id}`);
  }

  createRoom(room: CreateRoom): Observable<Result<Room>> {
    return this.http.post<Result<Room>>(this.apiUrl, room);
  }

  updateRoom(id: number, room: UpdateRoom): Observable<Result<Room>> {
    return this.http.put<Result<Room>>(`${this.apiUrl}/${id}`, room);
  }

  toggleRoomStatus(id: number): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  getRoomAvailability(roomId: number, date?: Date): Observable<RoomAvailability> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date.toISOString());
    }
    return this.http.get<RoomAvailability>(`${this.apiUrl}/${roomId}/availability`, { params });
  }

  getRoomBookings(roomId: number, startDate?: Date, endDate?: Date): Observable<BookingSlot[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<BookingSlot[]>(`${this.apiUrl}/${roomId}/bookings`, { params });
  }

  getAmenities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/amenities`);
  }
}
