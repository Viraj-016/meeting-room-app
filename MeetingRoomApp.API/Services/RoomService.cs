using Microsoft.EntityFrameworkCore;
using MeetingRoomApp.API.Data;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Models;
using System.Text.Json;

namespace MeetingRoomApp.API.Services;

public interface IRoomService
{
    Task<PagedResult<RoomSummaryDto>> GetAllRoomsAsync(int page = 1, int pageSize = 10, string? search = null, int? minCapacity = null, string? location = null, string? amenity = null, bool includeInactive = false);
    Task<Result<RoomDetailDto>> GetRoomByIdAsync(int id);
    Task<Result<RoomSummaryDto>> CreateRoomAsync(CreateRoomDto dto);
    Task<Result<RoomSummaryDto>> UpdateRoomAsync(int id, UpdateRoomDto dto);
    Task<Result> ToggleRoomStatusAsync(int id);
    Task<RoomAvailabilityDto> GetRoomAvailabilityAsync(int roomId, DateTime date);
    Task<List<BookingSlotDto>> GetRoomBookingsAsync(int roomId, DateTime? startDate = null, DateTime? endDate = null);
}

public class RoomService : IRoomService
{
    private readonly AppDbContext _context;

    public RoomService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<RoomSummaryDto>> GetAllRoomsAsync(int page = 1, int pageSize = 10, string? search = null, int? minCapacity = null, string? location = null, string? amenity = null, bool includeInactive = false)
    {
        var query = _context.Rooms.AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(r => r.IsActive);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(r => r.Name.Contains(search) || (r.Description != null && r.Description.Contains(search)));
        }

        if (minCapacity.HasValue)
        {
            query = query.Where(r => r.Capacity >= minCapacity.Value);
        }

        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(r => r.Location != null && r.Location.Contains(location));
        }

        if (!string.IsNullOrEmpty(amenity))
        {
            query = query.Where(r => r.Amenities != null && r.Amenities.Contains(amenity));
        }

        var total = await query.CountAsync();

        var rooms = await query
            .OrderBy(r => r.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RoomSummaryDto
            {
                Id = r.Id,
                Name = r.Name,
                Capacity = r.Capacity,
                Location = r.Location,
                Amenities = string.IsNullOrEmpty(r.Amenities)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(r.Amenities) ?? new List<string>(),
                IsActive = r.IsActive,
                ImageUrl = r.ImageUrl
            })
            .ToListAsync();

        return new PagedResult<RoomSummaryDto>
        {
            Data = rooms,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<Result<RoomDetailDto>> GetRoomByIdAsync(int id)
    {
        var room = await _context.Rooms
            .Include(r => r.Bookings.Where(b =>
                b.StartTime.Date == DateTime.UtcNow.Date &&
                b.Status == "Confirmed"))
            .ThenInclude(b => b.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (room == null)
        {
            return Result<RoomDetailDto>.Fail("Room not found");
        }

        var todaysBookings = room.Bookings
            .OrderBy(b => b.StartTime)
            .Select(b => new BookingSlotDto
            {
                BookingId = b.Id,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                BookedBy = b.User.FullName,
                Title = b.Title
            })
            .ToList();

        var dto = new RoomDetailDto
        {
            Id = room.Id,
            Name = room.Name,
            Capacity = room.Capacity,
            Location = room.Location,
            Description = room.Description,
            Amenities = string.IsNullOrEmpty(room.Amenities)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(room.Amenities) ?? new List<string>(),
            IsActive = room.IsActive,
            ImageUrl = room.ImageUrl,
            TodaysBookings = todaysBookings,
            CreatedAt = room.CreatedAt
        };

        return Result<RoomDetailDto>.Ok(dto);
    }

    public async Task<Result<RoomSummaryDto>> CreateRoomAsync(CreateRoomDto dto)
    {
        var room = new Room
        {
            Name = dto.Name,
            Capacity = dto.Capacity,
            Location = dto.Location,
            Description = dto.Description,
            Amenities = dto.Amenities != null ? JsonSerializer.Serialize(dto.Amenities) : null,
            ImageUrl = dto.ImageUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        var result = new RoomSummaryDto
        {
            Id = room.Id,
            Name = room.Name,
            Capacity = room.Capacity,
            Location = room.Location,
            Amenities = dto.Amenities ?? new List<string>(),
            IsActive = room.IsActive,
            ImageUrl = room.ImageUrl
        };

        return Result<RoomSummaryDto>.Ok(result, "Room created successfully");
    }

    public async Task<Result<RoomSummaryDto>> UpdateRoomAsync(int id, UpdateRoomDto dto)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
        {
            return Result<RoomSummaryDto>.Fail("Room not found");
        }

        if (dto.Name != null) room.Name = dto.Name;
        if (dto.Capacity.HasValue) room.Capacity = dto.Capacity.Value;
        if (dto.Location != null) room.Location = dto.Location;
        if (dto.Description != null) room.Description = dto.Description;
        if (dto.Amenities != null) room.Amenities = JsonSerializer.Serialize(dto.Amenities);
        if (dto.ImageUrl != null) room.ImageUrl = dto.ImageUrl;
        if (dto.IsActive.HasValue) room.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();

        var result = new RoomSummaryDto
        {
            Id = room.Id,
            Name = room.Name,
            Capacity = room.Capacity,
            Location = room.Location,
            Amenities = string.IsNullOrEmpty(room.Amenities)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(room.Amenities) ?? new List<string>(),
            IsActive = room.IsActive,
            ImageUrl = room.ImageUrl
        };

        return Result<RoomSummaryDto>.Ok(result, "Room updated successfully");
    }

    public async Task<Result> ToggleRoomStatusAsync(int id)
    {
        var room = await _context.Rooms.FindAsync(id);

        if (room == null)
        {
            return Result.Fail("Room not found");
        }

        room.IsActive = !room.IsActive;
        await _context.SaveChangesAsync();

        return Result.Ok(room.IsActive ? "Room activated" : "Room deactivated");
    }

    public async Task<RoomAvailabilityDto> GetRoomAvailabilityAsync(int roomId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        var bookedSlots = await _context.Bookings
            .Include(b => b.User)
            .Where(b => b.RoomId == roomId &&
                        b.Status == "Confirmed" &&
                        b.StartTime >= startOfDay &&
                        b.StartTime < endOfDay)
            .OrderBy(b => b.StartTime)
            .Select(b => new BookingSlotDto
            {
                BookingId = b.Id,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                BookedBy = b.User.FullName,
                Title = b.Title
            })
            .ToListAsync();

        return new RoomAvailabilityDto
        {
            RoomId = roomId,
            Date = date,
            BookedSlots = bookedSlots,
            IsAvailable = bookedSlots.Count == 0
        };
    }

    public async Task<List<BookingSlotDto>> GetRoomBookingsAsync(int roomId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.Bookings
            .Include(b => b.User)
            .Where(b => b.RoomId == roomId && b.Status == "Confirmed");

        if (startDate.HasValue)
        {
            query = query.Where(b => b.StartTime >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(b => b.EndTime <= endDate.Value);
        }

        return await query
            .OrderBy(b => b.StartTime)
            .Select(b => new BookingSlotDto
            {
                BookingId = b.Id,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                BookedBy = b.User.FullName,
                Title = b.Title
            })
            .ToListAsync();
    }
}
