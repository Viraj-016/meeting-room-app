import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { AdminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'rooms',
    loadComponent: () => import('./rooms/room-list/room-list.component').then(m => m.RoomListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'rooms/:id',
    loadComponent: () => import('./rooms/room-detail/room-detail.component').then(m => m.RoomDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./bookings/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'rooms',
        loadComponent: () => import('./admin/admin-rooms/admin-rooms.component').then(m => m.AdminRoomsComponent)
      },
      {
        path: 'rooms/new',
        loadComponent: () => import('./admin/room-form/room-form.component').then(m => m.RoomFormComponent)
      },
      {
        path: 'rooms/:id/edit',
        loadComponent: () => import('./admin/room-form/room-form.component').then(m => m.RoomFormComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./admin/admin-user-detail/admin-user-detail.component').then(m => m.AdminUserDetailComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./admin/admin-bookings/admin-bookings.component').then(m => m.AdminBookingsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./admin/admin-reports/admin-reports.component').then(m => m.AdminReportsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
