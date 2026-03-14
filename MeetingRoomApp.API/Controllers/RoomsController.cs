using Microsoft.AspNetCore.Mvc;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Services;
using MeetingRoomApp.API.Middleware;

namespace MeetingRoomApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    [RequireAuth]
    public async Task<IActionResult> GetAllRooms(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? minCapacity = null,
        [FromQuery] string? location = null,
        [FromQuery] string? amenity = null,
        [FromQuery] bool includeInactive = false)
    {
        // Only admins can see inactive rooms
        if (includeInactive && !HttpContext.Session.IsAdmin())
        {
            includeInactive = false;
        }

        var result = await _roomService.GetAllRoomsAsync(page, pageSize, search, minCapacity, location, amenity, includeInactive);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [RequireAuth]
    public async Task<IActionResult> GetRoomById(int id)
    {
        var result = await _roomService.GetRoomByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPost]
    [AdminOnly]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var result = await _roomService.CreateRoomAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetRoomById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    [AdminOnly]
    public async Task<IActionResult> UpdateRoom(int id, [FromBody] UpdateRoomDto dto)
    {
        var result = await _roomService.UpdateRoomAsync(id, dto);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPut("{id}/toggle-status")]
    [AdminOnly]
    public async Task<IActionResult> ToggleRoomStatus(int id)
    {
        var result = await _roomService.ToggleRoomStatusAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpGet("{id}/availability")]
    [RequireAuth]
    public async Task<IActionResult> GetRoomAvailability(int id, [FromQuery] DateTime? date = null)
    {
        var targetDate = date ?? DateTime.UtcNow.Date;
        var result = await _roomService.GetRoomAvailabilityAsync(id, targetDate);
        return Ok(result);
    }

    [HttpGet("{id}/bookings")]
    [RequireAuth]
    public async Task<IActionResult> GetRoomBookings(
        int id,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var result = await _roomService.GetRoomBookingsAsync(id, startDate, endDate);
        return Ok(result);
    }

    [HttpGet("amenities")]
    [RequireAuth]
    public IActionResult GetAmenities()
    {
        var amenities = new List<string>
        {
            "Projector",
            "Whiteboard",
            "TV Screen",
            "Video Conf",
            "Coffee Bar",
            "Standing Desks",
            "Mics",
            "Drawing Tablets",
            "4K Display",
            "Sound System"
        };

        return Ok(amenities);
    }
}
