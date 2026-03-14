using Microsoft.EntityFrameworkCore;
using MeetingRoomApp.API.Data;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Models;

namespace MeetingRoomApp.API.Services;

public interface IBookingService
{
    Task<PagedResult<BookingResponseDto>> GetAllBookingsAsync(BookingFilterDto filter);
    Task<Result<BookingResponseDto>> GetBookingByIdAsync(int id);
    Task<Result<BookingResponseDto>> CreateBookingAsync(int userId, CreateBookingDto dto);
    Task<Result> CancelBookingAsync(int bookingId, int userId, bool isAdmin, CancelBookingDto dto);
    Task<List<BookingResponseDto>> GetMyBookingsAsync(int userId, string? status = null);
    Task<List<BookingResponseDto>> GetTodayBookingsAsync(int? userId = null);
    Task<List<BookingResponseDto>> GetUpcomingBookingsAsync(int userId, int days = 7);
    Task UpdateCompletedBookingsAsync();
}

public class BookingService : IBookingService
{
    private readonly AppDbContext _context;

    public BookingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<BookingResponseDto>> GetAllBookingsAsync(BookingFilterDto filter)
    {
        var query = _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .AsQueryable();

        if (filter.RoomId.HasValue)
        {
            query = query.Where(b => b.RoomId == filter.RoomId.Value);
        }

        if (filter.UserId.HasValue)
        {
            query = query.Where(b => b.UserId == filter.UserId.Value);
        }

        if (!string.IsNullOrEmpty(filter.Status))
        {
            query = query.Where(b => b.Status == filter.Status);
        }

        if (filter.StartDate.HasValue)
        {
            query = query.Where(b => b.StartTime >= filter.StartDate.Value);
        }

        if (filter.EndDate.HasValue)
        {
            query = query.Where(b => b.EndTime <= filter.EndDate.Value);
        }

        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            query = query.Where(b =>
                b.Title.Contains(filter.SearchTerm) ||
                b.User.FullName.Contains(filter.SearchTerm) ||
                b.Room.Name.Contains(filter.SearchTerm));
        }

        var total = await query.CountAsync();

        var bookings = await query
            .OrderByDescending(b => b.StartTime)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(b => new BookingResponseDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                RoomName = b.Room.Name,
                RoomLocation = b.Room.Location,
                UserId = b.UserId,
                BookerName = b.User.FullName,
                BookerDepartment = b.User.Department,
                Title = b.Title,
                Description = b.Description,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Status = b.Status,
                CancelReason = b.CancelReason,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<BookingResponseDto>
        {
            Data = bookings,
            Total = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<Result<BookingResponseDto>> GetBookingByIdAsync(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            return Result<BookingResponseDto>.Fail("Booking not found");
        }

        var dto = new BookingResponseDto
        {
            Id = booking.Id,
            RoomId = booking.RoomId,
            RoomName = booking.Room.Name,
            RoomLocation = booking.Room.Location,
            UserId = booking.UserId,
            BookerName = booking.User.FullName,
            BookerDepartment = booking.User.Department,
            Title = booking.Title,
            Description = booking.Description,
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            Status = booking.Status,
            CancelReason = booking.CancelReason,
            CreatedAt = booking.CreatedAt
        };

        return Result<BookingResponseDto>.Ok(dto);
    }

    public async Task<Result<BookingResponseDto>> CreateBookingAsync(int userId, CreateBookingDto dto)
    {
        // Validate time constraints
        if (dto.StartTime <= DateTime.UtcNow)
        {
            return Result<BookingResponseDto>.Fail("Booking must be for a future time");
        }

        if (dto.EndTime <= dto.StartTime)
        {
            return Result<BookingResponseDto>.Fail("End time must be after start time");
        }

        // Check if room exists and is active
        var room = await _context.Rooms.FindAsync(dto.RoomId);
        if (room == null)
        {
            return Result<BookingResponseDto>.Fail("Room not found");
        }

        if (!room.IsActive)
        {
            return Result<BookingResponseDto>.Fail("Room is not available for booking");
        }

        // Check for overlapping bookings using serializable transaction
        using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        try
        {
            var hasConflict = await _context.Bookings
                .Where(b => b.RoomId == dto.RoomId &&
                           b.Status == "Confirmed" &&
                           b.StartTime < dto.EndTime &&
                           b.EndTime > dto.StartTime)
                .AnyAsync();

            if (hasConflict)
            {
                await transaction.RollbackAsync();
                return Result<BookingResponseDto>.Fail("This time slot conflicts with an existing booking");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                await transaction.RollbackAsync();
                return Result<BookingResponseDto>.Fail("User not found");
            }

            var booking = new Booking
            {
                RoomId = dto.RoomId,
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = "Confirmed",
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var response = new BookingResponseDto
            {
                Id = booking.Id,
                RoomId = booking.RoomId,
                RoomName = room.Name,
                RoomLocation = room.Location,
                UserId = booking.UserId,
                BookerName = user.FullName,
                BookerDepartment = user.Department,
                Title = booking.Title,
                Description = booking.Description,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Status = booking.Status,
                CreatedAt = booking.CreatedAt
            };

            return Result<BookingResponseDto>.Ok(response, "Booking created successfully");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<Result> CancelBookingAsync(int bookingId, int userId, bool isAdmin, CancelBookingDto dto)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);

        if (booking == null)
        {
            return Result.Fail("Booking not found");
        }

        if (booking.Status != "Confirmed")
        {
            return Result.Fail("Only confirmed bookings can be cancelled");
        }

        // Users can only cancel their own bookings, admins can cancel any
        if (booking.UserId != userId && !isAdmin)
        {
            return Result.Fail("You can only cancel your own bookings");
        }

        // Cannot cancel past bookings
        if (booking.StartTime <= DateTime.UtcNow)
        {
            return Result.Fail("Cannot cancel a booking that has already started");
        }

        booking.Status = "Cancelled";
        booking.CancelReason = dto.CancelReason;

        await _context.SaveChangesAsync();

        return Result.Ok("Booking cancelled successfully");
    }

    public async Task<List<BookingResponseDto>> GetMyBookingsAsync(int userId, string? status = null)
    {
        var query = _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .Where(b => b.UserId == userId);

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(b => b.Status == status);
        }

        return await query
            .OrderByDescending(b => b.StartTime)
            .Select(b => new BookingResponseDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                RoomName = b.Room.Name,
                RoomLocation = b.Room.Location,
                UserId = b.UserId,
                BookerName = b.User.FullName,
                BookerDepartment = b.User.Department,
                Title = b.Title,
                Description = b.Description,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Status = b.Status,
                CancelReason = b.CancelReason,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<BookingResponseDto>> GetTodayBookingsAsync(int? userId = null)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var query = _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .Where(b => b.StartTime >= today &&
                       b.StartTime < tomorrow &&
                       b.Status == "Confirmed");

        if (userId.HasValue)
        {
            query = query.Where(b => b.UserId == userId.Value);
        }

        return await query
            .OrderBy(b => b.StartTime)
            .Select(b => new BookingResponseDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                RoomName = b.Room.Name,
                RoomLocation = b.Room.Location,
                UserId = b.UserId,
                BookerName = b.User.FullName,
                BookerDepartment = b.User.Department,
                Title = b.Title,
                Description = b.Description,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Status = b.Status,
                CancelReason = b.CancelReason,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<BookingResponseDto>> GetUpcomingBookingsAsync(int userId, int days = 7)
    {
        var now = DateTime.UtcNow;
        var endDate = now.AddDays(days);

        return await _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .Where(b => b.UserId == userId &&
                       b.StartTime >= now &&
                       b.StartTime <= endDate &&
                       b.Status == "Confirmed")
            .OrderBy(b => b.StartTime)
            .Select(b => new BookingResponseDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                RoomName = b.Room.Name,
                RoomLocation = b.Room.Location,
                UserId = b.UserId,
                BookerName = b.User.FullName,
                BookerDepartment = b.User.Department,
                Title = b.Title,
                Description = b.Description,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Status = b.Status,
                CancelReason = b.CancelReason,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();
    }

    public async Task UpdateCompletedBookingsAsync()
    {
        var now = DateTime.UtcNow;

        var completedBookings = await _context.Bookings
            .Where(b => b.Status == "Confirmed" && b.EndTime < now)
            .ToListAsync();

        foreach (var booking in completedBookings)
        {
            booking.Status = "Completed";
        }

        await _context.SaveChangesAsync();
    }
}
