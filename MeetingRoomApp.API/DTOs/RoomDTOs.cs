using System.ComponentModel.DataAnnotations;

namespace MeetingRoomApp.API.DTOs;

// Room DTOs
public class CreateRoomDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Range(1, 500)]
    public int Capacity { get; set; }

    [MaxLength(100)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public List<string>? Amenities { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }
}

public class UpdateRoomDto
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [Range(1, 500)]
    public int? Capacity { get; set; }

    [MaxLength(100)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public List<string>? Amenities { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool? IsActive { get; set; }
}

public class RoomSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? Location { get; set; }
    public List<string> Amenities { get; set; } = new();
    public bool IsActive { get; set; }
    public string? ImageUrl { get; set; }
}

public class RoomDetailDto : RoomSummaryDto
{
    public string? Description { get; set; }
    public List<BookingSlotDto> TodaysBookings { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class BookingSlotDto
{
    public int BookingId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string BookedBy { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
}

public class RoomAvailabilityDto
{
    public int RoomId { get; set; }
    public DateTime Date { get; set; }
    public List<BookingSlotDto> BookedSlots { get; set; } = new();
    public bool IsAvailable { get; set; }
}
