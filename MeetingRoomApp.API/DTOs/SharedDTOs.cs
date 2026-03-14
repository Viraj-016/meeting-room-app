namespace MeetingRoomApp.API.DTOs;

public class PagedResult<T>
{
    public List<T> Data { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class Result<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static Result<T> Ok(T data, string message = "") => new() { Success = true, Data = data, Message = message };
    public static Result<T> Fail(string message) => new() { Success = false, Message = message };
}

public class Result
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;

    public static Result Ok(string message = "") => new() { Success = true, Message = message };
    public static Result Fail(string message) => new() { Success = false, Message = message };
}
