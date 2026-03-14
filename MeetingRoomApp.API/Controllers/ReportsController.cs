using Microsoft.AspNetCore.Mvc;
using MeetingRoomApp.API.DTOs;
using MeetingRoomApp.API.Services;
using MeetingRoomApp.API.Middleware;

namespace MeetingRoomApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AdminOnly]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _reportService.GetSummaryAsync();
        return Ok(result);
    }

    [HttpGet("room-usage")]
    public async Task<IActionResult> GetRoomUsage([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var filter = new ReportFilterDto { StartDate = startDate, EndDate = endDate };
        var result = await _reportService.GetRoomUsageAsync(filter);
        return Ok(result);
    }

    [HttpGet("peak-hours")]
    public async Task<IActionResult> GetPeakHours([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var filter = new ReportFilterDto { StartDate = startDate, EndDate = endDate };
        var result = await _reportService.GetPeakHoursAsync(filter);
        return Ok(result);
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartmentStats([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var filter = new ReportFilterDto { StartDate = startDate, EndDate = endDate };
        var result = await _reportService.GetDepartmentStatsAsync(filter);
        return Ok(result);
    }

    [HttpGet("monthly-trend")]
    public async Task<IActionResult> GetMonthlyTrend([FromQuery] int months = 12)
    {
        var result = await _reportService.GetMonthlyTrendAsync(months);
        return Ok(result);
    }
}
