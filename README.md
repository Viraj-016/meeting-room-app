# meeting-room-app
# 🏢 Meeting Room Management System

A full-stack web application for managing office meeting room bookings, built with ASP.NET Core 8, Angular 17+, and SQLite.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 8 Web API (C#) |
| Frontend | Angular 17+ |
| Database | SQLite via Entity Framework Core |
| UI Library | Angular Material / PrimeNG |
| Charts | Chart.js + ng2-charts |
| Authentication | Session-based (BCrypt password hashing) |
| API Docs | Swagger (Swashbuckle) |

---

## ✅ Features

- **Session-based login** with role-based access (Admin / User)
- **Room browsing** with filters by capacity, floor, and amenities
- **Booking system** with real-time availability checking
- **Double-booking prevention** using Serializable database transactions
- **Admin dashboard** with stats, room management, user management
- **Reports & analytics** with charts (room usage, peak hours, department stats, monthly trends)
- **User profile** management with password change
- **My Bookings** with tabs for Upcoming, Past, and Cancelled

---

## 📁 Project Structure

```
/MeetingRoomApp
  /MeetingRoomApp.API          ← ASP.NET Core backend
    /Controllers
    /Models
    /DTOs
    /Services
    /Middleware
    /Data
    /Migrations
    appsettings.json
    Program.cs

  /meeting-room-client          ← Angular frontend
    /src/app
      /auth
      /admin
      /rooms
      /bookings
      /dashboard
      /profile
      /reports
      /shared
```

---

## 🗃️ Database Schema

```
Users       → Id, Username, Email, PasswordHash, FullName, Department, Phone, Role, IsActive
Rooms       → Id, Name, Capacity, Location, Description, Amenities, IsActive, ImageUrl
Bookings    → Id, RoomId, UserId, Title, Description, StartTime, EndTime, Status, CancelReason
```

---

## ⚙️ Prerequisites

Make sure the following are installed on your machine before running the project:

| Tool | Version | Download |
|---|---|---|
| .NET SDK | 8.0 | https://dotnet.microsoft.com/download |
| Node.js | 18+ (LTS) | https://nodejs.org |
| Angular CLI | Latest | `npm install -g @angular/cli` |
| EF Core CLI | Latest | `dotnet tool install --global dotnet-ef` |

### Verify installations
```bash
dotnet --version
node --version
npm --version
ng version
dotnet ef --version
```

---

## 🚀 Getting Started

### 1. Clone or Extract the Project

```bash
# If using git
git clone <repository-url>
cd MeetingRoomApp

# If using ZIP — extract and open the folder
```

---

### 2. Backend Setup

```bash
# Navigate to API project
cd MeetingRoomApp.API

# Restore NuGet packages
dotnet restore

# Apply migrations and create SQLite database with seed data
dotnet ef database update

# Run the backend
dotnet run
```

> Backend runs at: `http://localhost:5000` or `https://localhost:5001`
> Swagger UI at: `https://localhost:5001/swagger`

---

### 3. Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to Angular project
cd meeting-room-client

# Install npm packages
npm install

# Start the development server
ng serve
```

> Frontend runs at: `http://localhost:4200`

---

## 🌱 Demo Credentials

### Admin Accounts

| Username | Password | Name | Department |
|---|---|---|---|
| `admin` | `Admin@123` | System Administrator | IT |
| `hr_admin` | `Admin@123` | Rachel Green | HR |

### User Accounts

| Username | Password | Name | Department |
|---|---|---|---|
| `john.doe` | `User@123` | John Doe | Engineering |
| `sara.smith` | `User@123` | Sara Smith | Marketing |
| `mike.jones` | `User@123` | Mike Jones | Sales |
| `emily.clark` | `User@123` | Emily Clark | Finance |
| `david.lee` | `User@123` | David Lee | Engineering |
| `anna.white` | `User@123` | Anna White | Design |
| `tom.brown` | `User@123` | Tom Brown | Operations |
| `lisa.wang` | `User@123` | Lisa Wang | Legal |
| `james.patel` | `User@123` | James Patel | HR |
| `nina.ross` | `User@123` | Nina Ross | Marketing |

---

## 🏢 Demo Rooms (10 Rooms)

| Room | Capacity | Location |
|---|---|---|
| Executive Board Room | 20 | Floor 5, Block A |
| Innovation Lab | 15 | Floor 3, Block B |
| Conference Room A | 10 | Floor 2, Block A |
| Conference Room B | 10 | Floor 2, Block A |
| Huddle Space Alpha | 4 | Floor 1, Block C |
| Huddle Space Beta | 4 | Floor 1, Block C |
| Training Room | 30 | Floor 4, Block B |
| Design Studio | 8 | Floor 3, Block A |
| Client Presentation Room | 12 | Floor 5, Block A |
| War Room | 6 | Floor 2, Block B |

---

## 🔗 API Endpoints Overview

### Auth
```
POST   /api/auth/login       Login
POST   /api/auth/logout      Logout
GET    /api/auth/me          Get current session user
```

### Rooms
```
GET    /api/rooms                    List all rooms
GET    /api/rooms/{id}               Room detail
GET    /api/rooms/{id}/availability  Available slots for a date
POST   /api/rooms                    [Admin] Create room
PUT    /api/rooms/{id}               [Admin] Update room
PATCH  /api/rooms/{id}/toggle        [Admin] Activate / deactivate
```

### Bookings
```
GET    /api/bookings/my        My bookings
GET    /api/bookings/upcoming  My next 7 days bookings
GET    /api/bookings/today     Today's bookings
GET    /api/bookings/all       [Admin] All bookings
POST   /api/bookings           Create booking (conflict-safe)
DELETE /api/bookings/{id}      Cancel booking
```

### Users — Admin only
```
GET    /api/users              All users
GET    /api/users/{id}         User detail
POST   /api/users              Create user
PUT    /api/users/{id}         Update user
PATCH  /api/users/{id}/toggle  Activate / deactivate user
```

### Reports — Admin only
```
GET    /api/reports/summary         Key metrics
GET    /api/reports/room-usage      Bookings per room
GET    /api/reports/peak-hours      Busiest hours of day
GET    /api/reports/department      Bookings by department
GET    /api/reports/monthly-trend   12-month booking trend
```

---

## 🛡️ Business Rules

1. A room **cannot be double-booked** — enforced via Serializable database transaction
2. Bookings must be **in the future** — validated on both frontend and backend
3. **End time must be after start time**
4. Users can only **cancel their own** bookings; admins can cancel any
5. Only **admins** can add, edit, or deactivate rooms
6. Only **admins** can create users or change user roles
7. **Deactivated users** cannot log in
8. **Deactivated rooms** do not appear in the room list for regular users
9. Cancelling a booking **requires a reason**
10. Past bookings are automatically marked as **Completed**

---

## 📦 NuGet Packages (Backend)

```
Microsoft.EntityFrameworkCore.Sqlite
Microsoft.EntityFrameworkCore.Tools
Microsoft.AspNetCore.Session
Swashbuckle.AspNetCore
BCrypt.Net-Next
```

## 📦 npm Packages (Frontend)

```
@angular/material (or primeng + primeicons)
@angular/cdk
ng2-charts
chart.js
ngx-toastr
```

---

## 🔄 Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login page |
| `/dashboard` | User + Admin | Home dashboard |
| `/rooms` | User + Admin | Browse rooms |
| `/rooms/:id` | User + Admin | Room detail + booking form |
| `/my-bookings` | User + Admin | My booking history |
| `/profile` | User + Admin | Edit profile |
| `/admin/dashboard` | Admin only | Admin overview |
| `/admin/rooms` | Admin only | Manage rooms |
| `/admin/users` | Admin only | Manage users |
| `/admin/bookings` | Admin only | All bookings |
| `/admin/reports` | Admin only | Charts & analytics |

---

## 🗂️ Architecture Overview

```
Request → CORS → Session Middleware → SessionAuthMiddleware
       → ExceptionMiddleware → Router → AdminOnlyFilter (if needed)
       → Controller → Service → AppDbContext → SQLite
       → DTO response → Angular
```

---

## 👨‍💻 Development Notes

- The SQLite database file `meetingrooms.db` is auto-created in the API project root after running `dotnet ef database update`
- All 25 sample bookings are pre-seeded covering past, present, and future dates
- Session timeout is set to **8 hours**
- CORS is configured for `http://localhost:4200`
- Angular HTTP Interceptor attaches `withCredentials: true` to all requests automatically

---

## 📄 License

This project is for educational purposes.
