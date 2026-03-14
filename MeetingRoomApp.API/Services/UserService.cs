using Microsoft.EntityFrameworkCore;
using MeetingRoomApp.API.Data;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Models;
using System.Text.Json;

namespace MeetingRoomApp.API.Services;

public interface IUserService
{
    Task<PagedResult<UserSummaryDto>> GetAllUsersAsync(int page = 1, int pageSize = 10, string? search = null, string? department = null, string? role = null, bool? isActive = null);
    Task<Result<UserDetailDto>> GetUserByIdAsync(int id);
    Task<Result<UserSummaryDto>> CreateUserAsync(CreateUserDto dto);
    Task<Result<UserSummaryDto>> UpdateUserAsync(int id, UpdateUserDto dto);
    Task<Result> ToggleUserStatusAsync(int id);
    Task<Result> ChangePasswordAsync(int userId, ChangePasswordDto dto);
    Task<PagedResult<BookingResponseDto>> GetUserBookingsAsync(int userId, int page = 1, int pageSize = 10, string? status = null);
}

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<UserSummaryDto>> GetAllUsersAsync(int page = 1, int pageSize = 10, string? search = null, string? department = null, string? role = null, bool? isActive = null)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u => u.FullName.Contains(search) || u.Username.Contains(search) || u.Email.Contains(search));
        }

        if (!string.IsNullOrEmpty(department))
        {
            query = query.Where(u => u.Department == department);
        }

        if (!string.IsNullOrEmpty(role))
        {
            query = query.Where(u => u.Role == role);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var total = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserSummaryDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                Department = u.Department,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<UserSummaryDto>
        {
            Data = users,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<Result<UserDetailDto>> GetUserByIdAsync(int id)
    {
        var user = await _context.Users
            .Include(u => u.Bookings)
                .ThenInclude(b => b.Room)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return Result<UserDetailDto>.Fail("User not found");
        }

        var recentBookings = user.Bookings
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => new BookingResponseDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                RoomName = b.Room.Name,
                RoomLocation = b.Room.Location,
                UserId = b.UserId,
                BookerName = user.FullName,
                Title = b.Title,
                Description = b.Description,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Status = b.Status,
                CancelReason = b.CancelReason,
                CreatedAt = b.CreatedAt
            })
            .ToList();

        var dto = new UserDetailDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Department = user.Department,
            Phone = user.Phone,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            BookingCount = user.Bookings.Count,
            LastBookingDate = user.Bookings.OrderByDescending(b => b.CreatedAt).FirstOrDefault()?.CreatedAt,
            RecentBookings = recentBookings
        };

        return Result<UserDetailDto>.Ok(dto);
    }

    public async Task<Result<UserSummaryDto>> CreateUserAsync(CreateUserDto dto)
    {
        // Check for existing username
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
        {
            return Result<UserSummaryDto>.Fail("Username already exists");
        }

        // Check for existing email
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return Result<UserSummaryDto>.Fail("Email already exists");
        }

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName,
            Department = dto.Department,
            Phone = dto.Phone,
            Role = dto.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var result = new UserSummaryDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Department = user.Department,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return Result<UserSummaryDto>.Ok(result, "User created successfully");
    }

    public async Task<Result<UserSummaryDto>> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return Result<UserSummaryDto>.Fail("User not found");
        }

        // Check email uniqueness if changing
        if (dto.Email != null && dto.Email != user.Email)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id))
            {
                return Result<UserSummaryDto>.Fail("Email already exists");
            }
            user.Email = dto.Email;
        }

        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.Department != null) user.Department = dto.Department;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.Role != null) user.Role = dto.Role;

        await _context.SaveChangesAsync();

        var result = new UserSummaryDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Department = user.Department,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return Result<UserSummaryDto>.Ok(result, "User updated successfully");
    }

    public async Task<Result> ToggleUserStatusAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return Result.Fail("User not found");
        }

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        return Result.Ok(user.IsActive ? "User activated" : "User deactivated");
    }

    public async Task<Result> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return Result.Fail("User not found");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return Result.Fail("Current password is incorrect");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Result.Ok("Password changed successfully");
    }

    public async Task<PagedResult<BookingResponseDto>> GetUserBookingsAsync(int userId, int page = 1, int pageSize = 10, string? status = null)
    {
        var query = _context.Bookings
            .Include(b => b.Room)
            .Include(b => b.User)
            .Where(b => b.UserId == userId);

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(b => b.Status == status);
        }

        var total = await query.CountAsync();

        var bookings = await query
            .OrderByDescending(b => b.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
            Page = page,
            PageSize = pageSize
        };
    }
}
