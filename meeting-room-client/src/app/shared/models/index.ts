// Auth models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  fullName: string;
  role: string;
  department?: string;
}

export interface SessionUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  department?: string;
}

// User models
export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  department?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserDetail extends User {
  bookingCount: number;
  lastBookingDate?: Date;
  recentBookings: Booking[];
}

export interface CreateUser {
  username: string;
  email: string;
  password: string;
  fullName: string;
  department?: string;
  phone?: string;
  role: string;
}

export interface UpdateUser {
  email?: string;
  fullName?: string;
  department?: string;
  phone?: string;
  role?: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

// Room models
export interface Room {
  id: number;
  name: string;
  capacity: number;
  location?: string;
  amenities: string[];
  isActive: boolean;
  imageUrl?: string;
}

export interface RoomDetail extends Room {
  description?: string;
  todaysBookings: BookingSlot[];
  createdAt: Date;
}

export interface CreateRoom {
  name: string;
  capacity: number;
  location?: string;
  description?: string;
  amenities?: string[];
  imageUrl?: string;
}

export interface UpdateRoom {
  name?: string;
  capacity?: number;
  location?: string;
  description?: string;
  amenities?: string[];
  imageUrl?: string;
  isActive?: boolean;
}

export interface BookingSlot {
  bookingId: number;
  startTime: Date;
  endTime: Date;
  bookedBy: string;
  title: string;
}

export interface RoomAvailability {
  roomId: number;
  date: Date;
  bookedSlots: BookingSlot[];
  isAvailable: boolean;
}

// Booking models
export interface Booking {
  id: number;
  roomId: number;
  roomName: string;
  roomLocation?: string;
  userId: number;
  bookerName: string;
  bookerDepartment?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: string;
  cancelReason?: string;
  createdAt: Date;
}

export interface CreateBooking {
  roomId: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
}

export interface CancelBooking {
  cancelReason: string;
}

export interface BookingFilter {
  roomId?: number;
  userId?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

// Report models
export interface Summary {
  totalRooms: number;
  activeRooms: number;
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  todayBookings: number;
  mostBookedRoom?: string;
  busiestDepartment?: string;
}

export interface RoomUsage {
  roomName: string;
  bookingCount: number;
  totalHours: number;
}

export interface PeakHour {
  hour: number;
  count: number;
}

export interface DepartmentStat {
  department: string;
  bookingCount: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
}

// Shared models
export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Result<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiResult {
  success: boolean;
  message: string;
}
