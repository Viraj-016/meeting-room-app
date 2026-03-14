using System.ComponentModel.DataAnnotations;

namespace MeetingRoomApp.API.DTOs;

// User DTOs
public class CreateUserDto
{
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Department { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [Required]
    public string Role { get; set; } = "User";
}

public class UpdateUserDto
{
    [EmailAddress]
    [MaxLength(100)]
    public string? Email { get; set; }

    [MaxLength(100)]
    public string? FullName { get; set; }

    [MaxLength(50)]
    public string? Department { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    public string? Role { get; set; }
}

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}

public class UserSummaryDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserDetailDto : UserSummaryDto
{
    public string? Phone { get; set; }
    public int BookingCount { get; set; }
    public DateTime? LastBookingDate { get; set; }
    public List<BookingResponseDto> RecentBookings { get; set; } = new();
}
