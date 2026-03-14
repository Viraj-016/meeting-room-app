import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReportService } from '../../shared/services/report.service';
import { Summary, RoomUsage, PeakHour, DepartmentStat, MonthlyTrend } from '../../shared/models';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    NgChartsModule
  ],
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.scss'
})
export class AdminReportsComponent implements OnInit {
  summary: Summary | null = null;
  loading = true;

  // Date range filter
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Room Usage Chart (Bar)
  roomUsageChartType = 'bar' as const;
  roomUsageChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Booking Count',
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 1
    }]
  };
  roomUsageChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Room Usage' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // Monthly Trend Chart (Line)
  monthlyTrendChartType = 'line' as const;
  monthlyTrendChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Bookings',
      fill: true,
      tension: 0.4,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }]
  };
  monthlyTrendChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Monthly Booking Trend' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // Peak Hours Chart (Bar)
  peakHoursChartType = 'bar' as const;
  peakHoursChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Bookings',
      backgroundColor: 'rgba(255, 159, 64, 0.8)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1
    }]
  };
  peakHoursChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Peak Booking Hours' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // Department Stats Chart (Doughnut)
  departmentChartType = 'doughnut' as const;
  departmentChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)'
      ],
      borderColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 1
    }]
  };
  departmentChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' },
      title: { display: true, text: 'Bookings by Department' }
    }
  };

  constructor(
    private reportService: ReportService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Set default date range to last 30 days
    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 30);

    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.loadSummary();
    this.loadRoomUsage();
    this.loadMonthlyTrend();
    this.loadPeakHours();
    this.loadDepartmentStats();
  }

  private loadSummary(): void {
    this.reportService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading summary:', error);
        this.toastr.error('Failed to load summary', 'Error');
        this.loading = false;
      }
    });
  }

  private loadRoomUsage(): void {
    this.reportService.getRoomUsage(this.startDate || undefined, this.endDate || undefined).subscribe({
      next: (data: RoomUsage[]) => {
        this.roomUsageChartData = {
          labels: data.map(d => d.roomName),
          datasets: [{
            data: data.map(d => d.bookingCount),
            label: 'Booking Count',
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1
          }]
        };
      },
      error: (error) => {
        console.error('Error loading room usage:', error);
      }
    });
  }

  private loadMonthlyTrend(): void {
    this.reportService.getMonthlyTrend(12).subscribe({
      next: (data: MonthlyTrend[]) => {
        this.monthlyTrendChartData = {
          labels: data.map(d => d.month),
          datasets: [{
            data: data.map(d => d.count),
            label: 'Bookings',
            fill: true,
            tension: 0.4,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          }]
        };
      },
      error: (error) => {
        console.error('Error loading monthly trend:', error);
      }
    });
  }

  private loadPeakHours(): void {
    this.reportService.getPeakHours(this.startDate || undefined, this.endDate || undefined).subscribe({
      next: (data: PeakHour[]) => {
        this.peakHoursChartData = {
          labels: data.map(d => this.formatHour(d.hour)),
          datasets: [{
            data: data.map(d => d.count),
            label: 'Bookings',
            backgroundColor: 'rgba(255, 159, 64, 0.8)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }]
        };
      },
      error: (error) => {
        console.error('Error loading peak hours:', error);
      }
    });
  }

  private loadDepartmentStats(): void {
    this.reportService.getDepartmentStats(this.startDate || undefined, this.endDate || undefined).subscribe({
      next: (data: DepartmentStat[]) => {
        this.departmentChartData = {
          labels: data.map(d => d.department || 'Unknown'),
          datasets: [{
            data: data.map(d => d.bookingCount),
            backgroundColor: [
              'rgba(102, 126, 234, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)'
            ],
            borderColor: [
              'rgba(102, 126, 234, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
          }]
        };
      },
      error: (error) => {
        console.error('Error loading department stats:', error);
      }
    });
  }

  onDateRangeChange(): void {
    this.loadRoomUsage();
    this.loadPeakHours();
    this.loadDepartmentStats();
  }

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${period}`;
  }
}
