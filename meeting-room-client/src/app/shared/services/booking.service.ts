import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, CreateBooking, CancelBooking, BookingFilter, PagedResult, Result, ApiResult } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  getAllBookings(filter: BookingFilter): Observable<PagedResult<Booking>> {
    let params = new HttpParams();

    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    if (filter.roomId) params = params.set('roomId', filter.roomId.toString());
    if (filter.userId) params = params.set('userId', filter.userId.toString());
    if (filter.status) params = params.set('status', filter.status);
    if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
    if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);

    return this.http.get<PagedResult<Booking>>(this.apiUrl, { params });
  }

  getBookingById(id: number): Observable<Result<Booking>> {
    return this.http.get<Result<Booking>>(`${this.apiUrl}/${id}`);
  }

  createBooking(booking: CreateBooking): Observable<Result<Booking>> {
    return this.http.post<Result<Booking>>(this.apiUrl, booking);
  }

  cancelBooking(id: number, dto: CancelBooking): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.apiUrl}/${id}/cancel`, dto);
  }

  getMyBookings(status?: string): Observable<Booking[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Booking[]>(`${this.apiUrl}/my`, { params });
  }

  getTodayBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/today`);
  }

  getUpcomingBookings(days: number = 7): Observable<Booking[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Booking[]>(`${this.apiUrl}/upcoming`, { params });
  }
}
