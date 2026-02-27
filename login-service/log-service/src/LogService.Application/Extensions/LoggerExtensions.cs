using System;
using Microsoft.Extensions.Logging;

namespace LoginService.Application.Extensions;

public static partial class LoggerExtensions
{
    [LoggerMessage(
        EventId = 1002,
        Level = LogLevel.Information,
        Message = "User login succeeded")]
    public static partial void LogUserLoggedIn(this ILogger logger);

    [LoggerMessage(
        EventId = 1003,
        Level = LogLevel.Warning,
        Message = "Failed login attempt")]
    public static partial void LogFailedLoginAttempt(this ILogger logger);
}
