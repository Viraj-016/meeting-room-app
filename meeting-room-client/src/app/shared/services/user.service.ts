import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserDetail, CreateUser, UpdateUser, ChangePassword, PagedResult, Result, Booking, ApiResult } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    department?: string,
    role?: string,
    isActive?: boolean
  ): Observable<PagedResult<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (department) params = params.set('department', department);
    if (role) params = params.set('role', role);
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());

    return this.http.get<PagedResult<User>>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<Result<UserDetail>> {
    return this.http.get<Result<UserDetail>>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUser): Observable<Result<User>> {
    return this.http.post<Result<User>>(this.apiUrl, user);
  }

  updateUser(id: number, user: UpdateUser): Observable<Result<User>> {
    return this.http.put<Result<User>>(`${this.apiUrl}/${id}`, user);
  }

  toggleUserStatus(id: number): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  changePassword(id: number, dto: ChangePassword): Observable<ApiResult> {
    return this.http.put<ApiResult>(`${this.apiUrl}/${id}/change-password`, dto);
  }

  getUserBookings(
    userId: number,
    page: number = 1,
    pageSize: number = 10,
    status?: string
  ): Observable<PagedResult<Booking>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);

    return this.http.get<PagedResult<Booking>>(`${this.apiUrl}/${userId}/bookings`, { params });
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/departments`);
  }
}
