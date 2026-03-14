using Microsoft.AspNetCore.Mvc;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Services;
using MeetingRoomApp.API.Middleware;

namespace MeetingRoomApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [AdminOnly]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? department = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await _userService.GetAllUsersAsync(page, pageSize, search, department, role, isActive);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [RequireAuth]
    public async Task<IActionResult> GetUserById(int id)
    {
        var sessionUser = HttpContext.Session.GetSessionUser();

        // Users can only view their own profile, admins can view any
        if (sessionUser?.UserId != id && !HttpContext.Session.IsAdmin())
        {
            return Forbid();
        }

        var result = await _userService.GetUserByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPost]
    [AdminOnly]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var result = await _userService.CreateUserAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetUserById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id}")]
    [RequireAuth]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        var sessionUser = HttpContext.Session.GetSessionUser();

        // Users can only update their own profile (except role), admins can update any
        if (sessionUser?.UserId != id && !HttpContext.Session.IsAdmin())
        {
            return Forbid();
        }

        // Non-admins cannot change roles
        if (!HttpContext.Session.IsAdmin() && dto.Role != null)
        {
            return Forbid();
        }

        var result = await _userService.UpdateUserAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPut("{id}/toggle-status")]
    [AdminOnly]
    public async Task<IActionResult> ToggleUserStatus(int id)
    {
        var result = await _userService.ToggleUserStatusAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPut("{id}/change-password")]
    [RequireAuth]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto dto)
    {
        var sessionUser = HttpContext.Session.GetSessionUser();

        // Users can only change their own password
        if (sessionUser?.UserId != id)
        {
            return Forbid();
        }

        var result = await _userService.ChangePasswordAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("{id}/bookings")]
    [RequireAuth]
    public async Task<IActionResult> GetUserBookings(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null)
    {
        var sessionUser = HttpContext.Session.GetSessionUser();

        // Users can only view their own bookings, admins can view any
        if (sessionUser?.UserId != id && !HttpContext.Session.IsAdmin())
        {
            return Forbid();
        }

        var result = await _userService.GetUserBookingsAsync(id, page, pageSize, status);
        return Ok(result);
    }

    [HttpGet("departments")]
    [RequireAuth]
    public async Task<IActionResult> GetDepartments()
    {
        // Get distinct departments for filter dropdowns
        var departments = await Task.FromResult(new List<string>
        {
            "IT", "Engineering", "Marketing", "Sales", "HR", "Finance", "Operations"
        });

        return Ok(departments);
    }
}
