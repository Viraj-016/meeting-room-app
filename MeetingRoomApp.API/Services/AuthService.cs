using Microsoft.EntityFrameworkCore;
using MeetingRoomApp.API.Data;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Models;

namespace MeetingRoomApp.API.Services;

public interface IAuthService
{
    Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request);
    Task<Result<UserSummaryDto>> GetCurrentUserAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;

    public AuthService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null)
        {
            return Result<LoginResponseDto>.Fail("Invalid username or password");
        }

        if (!user.IsActive)
        {
            return Result<LoginResponseDto>.Fail("Your account has been deactivated. Please contact an administrator.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Result<LoginResponseDto>.Fail("Invalid username or password");
        }

        var response = new LoginResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            Department = user.Department
        };

        return Result<LoginResponseDto>.Ok(response, "Login successful");
    }

    public async Task<Result<UserSummaryDto>> GetCurrentUserAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return Result<UserSummaryDto>.Fail("User not found");
        }

        var userDto = new UserSummaryDto
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

        return Result<UserSummaryDto>.Ok(userDto);
    }
}
