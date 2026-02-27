using LoginService.Application.DTOs;
using LoginService.Application.Interfaces;
using LoginService.Domain.Constants;
using LoginService.Domain.Entities;
using LoginService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using LoginService.Application.Extensions;
using System.Collections.Concurrent;

namespace LoginService.Application.Services;

public class LogService(
    IUserRepository userRepository,
    IPasswordHashService passwordHashService,
    IJwtTokenService jwtTokenService,
    ICloudinaryService cloudinaryService,
    IConfiguration configuration,
    ILogger<LogService> logger) : ILogService
{
    private readonly ICloudinaryService _cloudinaryService = cloudinaryService;
    private static readonly ConcurrentDictionary<string, AttemptState> AttemptTracker = new();
    private const int MaxFailedAttempts = 5;
    private const int LockoutMinutes = 15;

    public async Task<LogResponseDto> LoginAsync(LoginDto loginDto)
    {
        var loginKey = loginDto.EmailOrUsername.Trim().ToLowerInvariant();

        if (IsLockedOut(loginKey, out var loginLockRemaining))
        {
            throw new UnauthorizedAccessException($"Cuenta temporalmente bloqueada. Intenta nuevamente en {Math.Ceiling(loginLockRemaining.TotalMinutes)} minutos.");
        }

        User? user = null;

        if (loginDto.EmailOrUsername.Contains('@'))
        {
            user = await userRepository.GetByEmailAsync(loginDto.EmailOrUsername.ToLowerInvariant());
        }
        else
        {
            user = await userRepository.GetByUsernameAsync(loginDto.EmailOrUsername);
        }

        if (user == null)
        {
            RegisterFailedAttempt(loginKey);
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        var userKey = $"user:{user.Id}";
        if (IsLockedOut(userKey, out var userLockRemaining))
        {
            throw new UnauthorizedAccessException($"Cuenta temporalmente bloqueada. Intenta nuevamente en {Math.Ceiling(userLockRemaining.TotalMinutes)} minutos.");
        }

        if (!user.Status)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("La cuenta de usuario está deshabilitada");
        }

        if (!passwordHashService.VerifyPassword(loginDto.Password, user.Password))
        {
            RegisterFailedAttempt(loginKey);
            RegisterFailedAttempt(userKey);
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        ResetAttemptState(loginKey);
        ResetAttemptState(userKey);

        logger.LogUserLoggedIn();

        var token = jwtTokenService.GenerateToken(user);
        var expiryMinutes = int.Parse(configuration["JwtSettings:ExpiryInMinutes"] ?? "30");

        return new LogResponseDto
        {
            Success = true,
            Message = "Login exitoso",
            Token = token,
            UserDetails = MapToUserDetailsDto(user),
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
        };
    }

    private UserDetailsDto MapToUserDetailsDto(User user)
    {
        return new UserDetailsDto
        {
            Id = user.Id,
            Username = user.Username,
            ProfilePicture = _cloudinaryService.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Role = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.CLIENT
        };
    }

    private static void RegisterFailedAttempt(string key)
    {
        AttemptTracker.AddOrUpdate(
            key,
            _ => new AttemptState { FailedAttempts = 1, LockedUntilUtc = null },
            (_, current) =>
            {
                if (current.LockedUntilUtc.HasValue && current.LockedUntilUtc.Value > DateTime.UtcNow)
                {
                    return current;
                }

                current.FailedAttempts++;

                if (current.FailedAttempts >= MaxFailedAttempts)
                {
                    current.LockedUntilUtc = DateTime.UtcNow.AddMinutes(LockoutMinutes);
                    current.FailedAttempts = 0;
                }

                return current;
            });
    }

    private static bool IsLockedOut(string key, out TimeSpan remaining)
    {
        remaining = TimeSpan.Zero;

        if (!AttemptTracker.TryGetValue(key, out var state) || !state.LockedUntilUtc.HasValue)
        {
            return false;
        }

        var lockUntil = state.LockedUntilUtc.Value;
        if (lockUntil <= DateTime.UtcNow)
        {
            AttemptTracker.TryRemove(key, out _);
            return false;
        }

        remaining = lockUntil - DateTime.UtcNow;
        return true;
    }

    private static void ResetAttemptState(string key)
    {
        AttemptTracker.TryRemove(key, out _);
    }

    private class AttemptState
    {
        public int FailedAttempts { get; set; }
        public DateTime? LockedUntilUtc { get; set; }
    }
}

