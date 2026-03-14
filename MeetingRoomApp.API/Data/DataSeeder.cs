using MeetingRoomApp.API.Models;
using BCrypt.Net;

namespace MeetingRoomApp.API.Data;

public static class DataSeeder
{
    public static void Seed(AppDbContext context)
    {
        if (context.Users.Any()) return;

        // Seed Users (10 users: 2 admins, 8 regular users)
        var users = new List<User>
        {
            new User
            {
                Username = "admin",
                Email = "admin@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FullName = "System Administrator",
                Department = "IT",
                Phone = "555-0100",
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-6)
            },
            new User
            {
                Username = "sarah.admin",
                Email = "sarah.admin@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                FullName = "Sarah Johnson",
                Department = "Operations",
                Phone = "555-0101",
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-5)
            },
            new User
            {
                Username = "john.doe",
                Email = "john.doe@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "John Doe",
                Department = "Engineering",
                Phone = "555-0102",
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-4)
            },
            new User
            {
                Username = "jane.smith",
                Email = "jane.smith@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "Jane Smith",
                Department = "Marketing",
                Phone = "555-0103",
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-4)
            },
            new User
            {
                Username = "mike.wilson",
                Email = "mike.wilson@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "Mike Wilson",
                Department = "Sales",
                Phone = "555-0104",
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            },
            new User
            {
                Username = "emily.davis",
                Email = "emily.davis@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "Emily Davis",
                Department = "HR",
                Phone = "555-0105",
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            },
            new User
            {
                Username = "robert.brown",
                Email = "robert.brown@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "Robert Brown",
                Department = "Engineering",
                Phone = "555-0106",
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            },
            new User
            {
                Username = "lisa.taylor",
                Email = "lisa.taylor@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "Lisa Taylor",
                Department = "Finance",
                Phone = "555-0107",
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            },
            new User
            {
                Username = "david.lee",
                Email = "david.lee@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "David Lee",
                Department = "Engineering",
                Phone = "555-0108",
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            },
            new User
            {
                Username = "anna.martinez",
                Email = "anna.martinez@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                FullName = "Anna Martinez",
                Department = "Marketing",
                Phone = "555-0109",
                Role = "User",
                IsActive = false, // Inactive user for testing
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            }
        };

        context.Users.AddRange(users);
        context.SaveChanges();

        // Seed Rooms (10 rooms)
        var rooms = new List<Room>
        {
            new Room
            {
                Name = "Conference Room A",
                Capacity = 20,
                Location = "Floor 1, Block A",
                Description = "Large conference room with panoramic windows",
                Amenities = "[\"Projector\",\"Whiteboard\",\"Video Conf\",\"TV Screen\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-6)
            },
            new Room
            {
                Name = "Meeting Room B",
                Capacity = 8,
                Location = "Floor 1, Block B",
                Description = "Cozy meeting room for small teams",
                Amenities = "[\"Whiteboard\",\"TV Screen\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-6)
            },
            new Room
            {
                Name = "Board Room",
                Capacity = 15,
                Location = "Floor 3, Block A",
                Description = "Executive board room with premium amenities",
                Amenities = "[\"Projector\",\"Whiteboard\",\"Video Conf\",\"TV Screen\",\"Coffee Bar\",\"Sound System\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-5)
            },
            new Room
            {
                Name = "Innovation Hub",
                Capacity = 12,
                Location = "Floor 2, Block A",
                Description = "Creative space for brainstorming sessions",
                Amenities = "[\"Whiteboard\",\"Drawing Tablets\",\"Standing Desks\",\"4K Display\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-5)
            },
            new Room
            {
                Name = "Training Room",
                Capacity = 30,
                Location = "Floor 2, Block B",
                Description = "Large training room with individual workstations",
                Amenities = "[\"Projector\",\"Whiteboard\",\"Mics\",\"Sound System\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-4)
            },
            new Room
            {
                Name = "Quick Sync Room",
                Capacity = 4,
                Location = "Floor 1, Block A",
                Description = "Small room for quick sync meetings",
                Amenities = "[\"TV Screen\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-4)
            },
            new Room
            {
                Name = "Video Conference Suite",
                Capacity = 10,
                Location = "Floor 3, Block B",
                Description = "Dedicated room for video conferences",
                Amenities = "[\"Video Conf\",\"4K Display\",\"Mics\",\"Sound System\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            },
            new Room
            {
                Name = "Workshop Room",
                Capacity = 25,
                Location = "Floor 2, Block A",
                Description = "Flexible workshop space",
                Amenities = "[\"Projector\",\"Whiteboard\",\"Standing Desks\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            },
            new Room
            {
                Name = "Executive Meeting Room",
                Capacity = 6,
                Location = "Floor 3, Block A",
                Description = "Premium room for executive meetings",
                Amenities = "[\"Video Conf\",\"TV Screen\",\"Coffee Bar\"]",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            },
            new Room
            {
                Name = "Old Meeting Room",
                Capacity = 10,
                Location = "Floor 1, Block C",
                Description = "Legacy meeting room - scheduled for renovation",
                Amenities = "[\"Whiteboard\"]",
                IsActive = false, // Inactive room for testing
                ImageUrl = "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800",
                CreatedAt = DateTime.UtcNow.AddMonths(-6)
            }
        };

        context.Rooms.AddRange(rooms);
        context.SaveChanges();

        // Seed Bookings (15 bookings - mix of past, present, and future)
        var today = DateTime.UtcNow.Date;
        var bookings = new List<Booking>
        {
            // Past bookings (completed)
            new Booking
            {
                RoomId = 1, UserId = 3,
                Title = "Q4 Planning Meeting",
                Description = "Quarterly planning session for engineering team",
                StartTime = today.AddDays(-10).AddHours(9),
                EndTime = today.AddDays(-10).AddHours(11),
                Status = "Completed",
                CreatedAt = today.AddDays(-15)
            },
            new Booking
            {
                RoomId = 3, UserId = 4,
                Title = "Marketing Strategy Review",
                Description = "Review of marketing campaigns",
                StartTime = today.AddDays(-7).AddHours(14),
                EndTime = today.AddDays(-7).AddHours(16),
                Status = "Completed",
                CreatedAt = today.AddDays(-10)
            },
            new Booking
            {
                RoomId = 2, UserId = 5,
                Title = "Sales Pipeline Review",
                Description = "Weekly sales pipeline discussion",
                StartTime = today.AddDays(-5).AddHours(10),
                EndTime = today.AddDays(-5).AddHours(11),
                Status = "Completed",
                CreatedAt = today.AddDays(-8)
            },
            new Booking
            {
                RoomId = 4, UserId = 7,
                Title = "Code Review Session",
                Description = "Team code review",
                StartTime = today.AddDays(-3).AddHours(13),
                EndTime = today.AddDays(-3).AddHours(15),
                Status = "Completed",
                CreatedAt = today.AddDays(-5)
            },
            // Cancelled booking
            new Booking
            {
                RoomId = 1, UserId = 6,
                Title = "HR Town Hall",
                Description = "Company-wide HR update",
                StartTime = today.AddDays(-2).AddHours(15),
                EndTime = today.AddDays(-2).AddHours(17),
                Status = "Cancelled",
                CancelReason = "Rescheduled to next week",
                CreatedAt = today.AddDays(-7)
            },
            // Today's bookings
            new Booking
            {
                RoomId = 1, UserId = 3,
                Title = "Sprint Planning",
                Description = "Two-week sprint planning session",
                StartTime = today.AddHours(9),
                EndTime = today.AddHours(11),
                Status = "Confirmed",
                CreatedAt = today.AddDays(-2)
            },
            new Booking
            {
                RoomId = 2, UserId = 4,
                Title = "Marketing Sync",
                Description = "Daily marketing team standup",
                StartTime = today.AddHours(10),
                EndTime = today.AddHours(10).AddMinutes(30),
                Status = "Confirmed",
                CreatedAt = today.AddDays(-1)
            },
            new Booking
            {
                RoomId = 3, UserId = 1,
                Title = "Executive Review",
                Description = "Monthly executive review meeting",
                StartTime = today.AddHours(14),
                EndTime = today.AddHours(16),
                Status = "Confirmed",
                CreatedAt = today.AddDays(-3)
            },
            // Future bookings
            new Booking
            {
                RoomId = 1, UserId = 7,
                Title = "Architecture Discussion",
                Description = "System architecture planning",
                StartTime = today.AddDays(1).AddHours(10),
                EndTime = today.AddDays(1).AddHours(12),
                Status = "Confirmed",
                CreatedAt = today.AddDays(-1)
            },
            new Booking
            {
                RoomId = 5, UserId = 2,
                Title = "New Employee Training",
                Description = "Onboarding session for new hires",
                StartTime = today.AddDays(2).AddHours(9),
                EndTime = today.AddDays(2).AddHours(17),
                Status = "Confirmed",
                CreatedAt = today.AddDays(-2)
            },
            new Booking
            {
                RoomId = 4, UserId = 9,
                Title = "Design Workshop",
                Description = "UI/UX design workshop",
                StartTime = today.AddDays(3).AddHours(13),
                EndTime = today.AddDays(3).AddHours(17),
                Status = "Confirmed",
                CreatedAt = today.AddDays(-1)
            },
            new Booking
            {
                RoomId = 7, UserId = 5,
                Title = "Client Demo",
                Description = "Product demo for potential client",
                StartTime = today.AddDays(4).AddHours(11),
                EndTime = today.AddDays(4).AddHours(12),
                Status = "Confirmed",
                CreatedAt = today
            },
            new Booking
            {
                RoomId = 6, UserId = 8,
                Title = "Budget Review",
                Description = "Finance team budget review",
                StartTime = today.AddDays(5).AddHours(15),
                EndTime = today.AddDays(5).AddHours(16),
                Status = "Confirmed",
                CreatedAt = today
            },
            new Booking
            {
                RoomId = 8, UserId = 3,
                Title = "Tech Talk",
                Description = "Internal tech presentation",
                StartTime = today.AddDays(6).AddHours(14),
                EndTime = today.AddDays(6).AddHours(15).AddMinutes(30),
                Status = "Confirmed",
                CreatedAt = today
            },
            new Booking
            {
                RoomId = 9, UserId = 4,
                Title = "Campaign Planning",
                Description = "Q1 campaign strategy session",
                StartTime = today.AddDays(7).AddHours(9),
                EndTime = today.AddDays(7).AddHours(11),
                Status = "Confirmed",
                CreatedAt = today
            }
        };

        context.Bookings.AddRange(bookings);
        context.SaveChanges();
    }
}
