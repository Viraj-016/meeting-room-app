using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MeetingRoomApp.API.Middleware;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireAuthAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        if (!context.HttpContext.Session.IsAuthenticated())
        {
            context.Result = new UnauthorizedObjectResult(new { success = false, message = "Authentication required" });
        }
    }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminOnlyAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        if (!context.HttpContext.Session.IsAuthenticated())
        {
            context.Result = new UnauthorizedObjectResult(new { success = false, message = "Authentication required" });
            return;
        }

        if (!context.HttpContext.Session.IsAdmin())
        {
            context.Result = new ObjectResult(new { success = false, message = "Admin access required" })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }
    }
}
