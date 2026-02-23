using System;
using Microsoft.Extensions.Logging;

namespace AuthService.Application.Extensions;

public static partial class LoggerExtensions
{
    [LoggerMessage(
        EventId = 1001,
        Level = LogLevel.Information,
        Message = "User {Username} registered successfully")]
    public static partial void LogUserRegistered(this ILogger logger, string username);

    [LoggerMessage(
        EventId = 1004,
        Level = LogLevel.Warning,
        Message = "Registration rejected: email already exists")]
    public static partial void LogRegistrationWithExistingEmail(this ILogger logger);

    [LoggerMessage(
        EventId = 1005,
        Level = LogLevel.Warning,
        Message = "Registration rejected: username already exists")]
    public static partial void LogRegistrationWithExistingUsername(this ILogger logger);

    [LoggerMessage(
        EventId = 1006,
        Level = LogLevel.Error,
        Message = "Error uploading profile image")]
    public static partial void LogImageUploadError(this ILogger logger);
}
