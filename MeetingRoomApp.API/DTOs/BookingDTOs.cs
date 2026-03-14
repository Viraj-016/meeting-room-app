using System.ComponentModel.DataAnnotations;

namespace MeetingRoomApp.API.DTOs;

// Booking DTOs
public class CreateBookingDto
{
    [Required]
    public int RoomId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}

public class CancelBookingDto
{
    [Required]
    [MinLength(1)]
    public string CancelReason { get; set; } = string.Empty;
}

public class BookingResponseDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public string? RoomLocation { get; set; }
    public int UserId { get; set; }
    public string BookerName { get; set; } = string.Empty;
    public string? BookerDepartment { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? CancelReason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class BookingFilterDto
{
    public int? RoomId { get; set; }
    public int? UserId { get; set; }
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
