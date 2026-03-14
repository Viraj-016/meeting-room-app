namespace MeetingRoomApp.API.DTOs;

// Report DTOs
public class RoomUsageDto
{
    public string RoomName { get; set; } = string.Empty;
    public int BookingCount { get; set; }
    public double TotalHours { get; set; }
}

public class PeakHourDto
{
    public int Hour { get; set; }
    public int Count { get; set; }
}

public class DepartmentDto
{
    public string Department { get; set; } = string.Empty;
    public int BookingCount { get; set; }
}

public class MonthlyTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class SummaryDto
{
    public int TotalRooms { get; set; }
    public int ActiveRooms { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalBookings { get; set; }
    public int TodayBookings { get; set; }
    public string? MostBookedRoom { get; set; }
    public string? BusiestDepartment { get; set; }
}

public class ReportFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
