using System.Text.Json;
using MeetingRoomApp.API.DTOs;

namespace MeetingRoomApp.API.Middleware;

public static class SessionExtensions
{
    private const string SessionUserKey = "SessionUser";

    public static void SetSessionUser(this ISession session, SessionUserDto user)
    {
        session.SetString(SessionUserKey, JsonSerializer.Serialize(user));
    }

    public static SessionUserDto? GetSessionUser(this ISession session)
    {
        var json = session.GetString(SessionUserKey);
        return string.IsNullOrEmpty(json) ? null : JsonSerializer.Deserialize<SessionUserDto>(json);
    }

    public static void ClearSessionUser(this ISession session)
    {
        session.Remove(SessionUserKey);
    }

    public static bool IsAuthenticated(this ISession session)
    {
        return session.GetSessionUser() != null;
    }

    public static bool IsAdmin(this ISession session)
    {
        return session.GetSessionUser()?.Role == "Admin";
    }
}
