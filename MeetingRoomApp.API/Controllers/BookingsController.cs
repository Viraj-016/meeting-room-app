using Microsoft.AspNetCore.Mvc;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Services;
using MeetingRoomApp.API.Middleware;

namespace MeetingRoomApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    [AdminOnly]
    public async Task<IActionResult> GetAllBookings([FromQuery] BookingFilterDto filter)
    {
        var result = await _bookingService.GetAllBookingsAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [RequireAuth]
    public async Task<IActionResult> GetBookingById(int id)
    {
        var result = await _bookingService.GetBookingByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPost]
    [RequireAuth]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var sessionUser = HttpContext.Session.GetSessionUser();
        if (sessionUser == null)
        {
            return Unauthorized(Result.Fail("Not authenticated"));
        }

        var result = await _bookingService.CreateBookingAsync(sessionUser.UserId, dto);
        if (!result.Success)
        {
            // Return 409 Conflict for booking conflicts
            if (result.Message.Contains("conflict"))
            {
                return Conflict(result);
            }
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetBookingById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}/cancel")]
    [RequireAuth]
    public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingDto dto)
    {
        var sessionUser = HttpContext.Session.GetSessionUser();
        if (sessionUser == null)
        {
            return Unauthorized(Result.Fail("Not authenticated"));
        }

        var result = await _bookingService.CancelBookingAsync(
            id,
            sessionUser.UserId,
            HttpContext.Session.IsAdmin(),
            dto);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("my")]
    [RequireAuth]
    public async Task<IActionResult> GetMyBookings([FromQuery] string? status = null)
    {
        var sessionUser = HttpContext.Session.GetSessionUser();
        if (sessionUser == null)
        {
            return Unauthorized(Result.Fail("Not authenticated"));
        }

        var result = await _bookingService.GetMyBookingsAsync(sessionUser.UserId, status);
        return Ok(result);
    }

    [HttpGet("today")]
    [RequireAuth]
    public async Task<IActionResult> GetTodayBookings()
    {
        var sessionUser = HttpContext.Session.GetSessionUser();
        if (sessionUser == null)
        {
            return Unauthorized(Result.Fail("Not authenticated"));
        }

        // If admin, show all today's bookings; otherwise, only user's bookings
        var userId = HttpContext.Session.IsAdmin() ? null : (int?)sessionUser.UserId;
        var result = await _bookingService.GetTodayBookingsAsync(userId);
        return Ok(result);
    }

    [HttpGet("upcoming")]
    [RequireAuth]
    public async Task<IActionResult> GetUpcomingBookings([FromQuery] int days = 7)
    {
        var sessionUser = HttpContext.Session.GetSessionUser();
        if (sessionUser == null)
        {
            return Unauthorized(Result.Fail("Not authenticated"));
        }

        var result = await _bookingService.GetUpcomingBookingsAsync(sessionUser.UserId, days);
        return Ok(result);
    }

    [HttpPost("update-completed")]
    [AdminOnly]
    public async Task<IActionResult> UpdateCompletedBookings()
    {
        await _bookingService.UpdateCompletedBookingsAsync();
        return Ok(Result.Ok("Completed bookings updated"));
    }
}
