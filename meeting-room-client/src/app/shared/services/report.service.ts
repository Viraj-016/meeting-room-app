import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Summary, RoomUsage, PeakHour, DepartmentStat, MonthlyTrend } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/summary`);
  }

  getRoomUsage(startDate?: Date, endDate?: Date): Observable<RoomUsage[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    return this.http.get<RoomUsage[]>(`${this.apiUrl}/room-usage`, { params });
  }

  getPeakHours(startDate?: Date, endDate?: Date): Observable<PeakHour[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    return this.http.get<PeakHour[]>(`${this.apiUrl}/peak-hours`, { params });
  }

  getDepartmentStats(startDate?: Date, endDate?: Date): Observable<DepartmentStat[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    return this.http.get<DepartmentStat[]>(`${this.apiUrl}/departments`, { params });
  }

  getMonthlyTrend(months: number = 12): Observable<MonthlyTrend[]> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<MonthlyTrend[]>(`${this.apiUrl}/monthly-trend`, { params });
  }
}
