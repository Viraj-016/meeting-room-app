using Microsoft.EntityFrameworkCore;
using MeetingRoomApp.API.Data;
using MeetingRoomApp.API.DTOs;

namespace MeetingRoomApp.API.Services;

public interface IReportService
{
    Task<SummaryDto> GetSummaryAsync();
    Task<List<RoomUsageDto>> GetRoomUsageAsync(ReportFilterDto? filter = null);
    Task<List<PeakHourDto>> GetPeakHoursAsync(ReportFilterDto? filter = null);
    Task<List<DepartmentDto>> GetDepartmentStatsAsync(ReportFilterDto? filter = null);
    Task<List<MonthlyTrendDto>> GetMonthlyTrendAsync(int months = 12);
}

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SummaryDto> GetSummaryAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var totalRooms = await _context.Rooms.CountAsync();
        var activeRooms = await _context.Rooms.CountAsync(r => r.IsActive);
        var totalUsers = await _context.Users.CountAsync();
        var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
        var totalBookings = await _context.Bookings.CountAsync();
        var todayBookings = await _context.Bookings
            .CountAsync(b => b.StartTime >= today &&
                            b.StartTime < tomorrow &&
                            b.Status == "Confirmed");

        // Most booked room
        var mostBookedRoom = await _context.Bookings
            .Where(b => b.Status != "Cancelled")
            .GroupBy(b => b.Room.Name)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        // Busiest department
        var busiestDepartment = await _context.Bookings
            .Where(b => b.Status != "Cancelled" && b.User.Department != null)
            .GroupBy(b => b.User.Department)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        return new SummaryDto
        {
            TotalRooms = totalRooms,
            ActiveRooms = activeRooms,
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalBookings = totalBookings,
            TodayBookings = todayBookings,
            MostBookedRoom = mostBookedRoom,
            BusiestDepartment = busiestDepartment
        };
    }

    public async Task<List<RoomUsageDto>> GetRoomUsageAsync(ReportFilterDto? filter = null)
    {
        var query = _context.Bookings
            .Include(b => b.Room)
            .Where(b => b.Status != "Cancelled")
            .AsQueryable();

        if (filter?.StartDate.HasValue == true)
        {
            query = query.Where(b => b.StartTime >= filter.StartDate.Value);
        }

        if (filter?.EndDate.HasValue == true)
        {
            query = query.Where(b => b.EndTime <= filter.EndDate.Value);
        }

        var bookings = await query.ToListAsync();

        var result = bookings
            .GroupBy(b => new { b.RoomId, b.Room.Name })
            .Select(g => new RoomUsageDto
            {
                RoomName = g.Key.Name,
                BookingCount = g.Count(),
                TotalHours = g.Sum(b => (b.EndTime - b.StartTime).TotalHours)
            })
            .OrderByDescending(r => r.BookingCount)
            .ToList();

        return result;
    }

    public async Task<List<PeakHourDto>> GetPeakHoursAsync(ReportFilterDto? filter = null)
    {
        var query = _context.Bookings
            .Where(b => b.Status != "Cancelled")
            .AsQueryable();

        if (filter?.StartDate.HasValue == true)
        {
            query = query.Where(b => b.StartTime >= filter.StartDate.Value);
        }

        if (filter?.EndDate.HasValue == true)
        {
            query = query.Where(b => b.EndTime <= filter.EndDate.Value);
        }

        var bookings = await query.ToListAsync();

        // Group by hour of day
        var result = bookings
            .GroupBy(b => b.StartTime.Hour)
            .Select(g => new PeakHourDto
            {
                Hour = g.Key,
                Count = g.Count()
            })
            .OrderBy(p => p.Hour)
            .ToList();

        // Fill in missing hours with zero counts
        var allHours = Enumerable.Range(0, 24)
            .Select(h => new PeakHourDto { Hour = h, Count = result.FirstOrDefault(r => r.Hour == h)?.Count ?? 0 })
            .ToList();

        return allHours;
    }

    public async Task<List<DepartmentDto>> GetDepartmentStatsAsync(ReportFilterDto? filter = null)
    {
        var query = _context.Bookings
            .Where(b => b.Status != "Cancelled" && b.User.Department != null)
            .AsQueryable();

        if (filter?.StartDate.HasValue == true)
        {
            query = query.Where(b => b.StartTime >= filter.StartDate.Value);
        }

        if (filter?.EndDate.HasValue == true)
        {
            query = query.Where(b => b.EndTime <= filter.EndDate.Value);
        }

        return await query
            .GroupBy(b => b.User.Department!)
            .Select(g => new DepartmentDto
            {
                Department = g.Key,
                BookingCount = g.Count()
            })
            .OrderByDescending(d => d.BookingCount)
            .ToListAsync();
    }

    public async Task<List<MonthlyTrendDto>> GetMonthlyTrendAsync(int months = 12)
    {
        var startDate = DateTime.UtcNow.AddMonths(-months + 1).Date;
        startDate = new DateTime(startDate.Year, startDate.Month, 1); // Start of month

        var bookings = await _context.Bookings
            .Where(b => b.Status != "Cancelled" && b.StartTime >= startDate)
            .ToListAsync();

        var result = bookings
            .GroupBy(b => new { b.StartTime.Year, b.StartTime.Month })
            .Select(g => new MonthlyTrendDto
            {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                Count = g.Count()
            })
            .OrderBy(m => m.Month)
            .ToList();

        // Fill in missing months
        var allMonths = new List<MonthlyTrendDto>();
        for (int i = 0; i < months; i++)
        {
            var date = startDate.AddMonths(i);
            var monthKey = $"{date.Year}-{date.Month:D2}";
            var existing = result.FirstOrDefault(r => r.Month == monthKey);
            allMonths.Add(new MonthlyTrendDto
            {
                Month = monthKey,
                Count = existing?.Count ?? 0
            });
        }

        return allMonths;
    }
}
