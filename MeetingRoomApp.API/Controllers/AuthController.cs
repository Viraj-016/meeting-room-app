using Microsoft.AspNetCore.Mvc;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Services;
using MeetingRoomApp.API.Middleware;

namespace MeetingRoomApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        // Set session
        HttpContext.Session.SetSessionUser(new SessionUserDto
        {
            UserId = result.Data!.Id,
            Role = result.Data.Role,
            FullName = result.Data.FullName
        });

        return Ok(result);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.ClearSessionUser();
        return Ok(Result.Ok("Logged out successfully"));
    }

    [HttpGet("me")]
    [RequireAuth]
    public async Task<IActionResult> GetCurrentUser()
    {
        var sessionUser = HttpContext.Session.GetSessionUser();
        if (sessionUser == null)
        {
            return Unauthorized(Result.Fail("Not authenticated"));
        }

        var result = await _authService.GetCurrentUserAsync(sessionUser.UserId);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
