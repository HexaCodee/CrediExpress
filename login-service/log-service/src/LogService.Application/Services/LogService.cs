using LoginService.Application.DTOs;
using LoginService.Application.Interfaces;
using LoginService.Domain.Constants;
using LoginService.Domain.Entities;
using LoginService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using LoginService.Application.Extensions;
using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace LoginService.Application.Services;

public class LogService(
    IUserRepository userRepository,
    IPasswordHashService passwordHashService,
    IJwtTokenService jwtTokenService,
    IEmailService emailService,
    ITokenRevocationService tokenRevocationService,
    ICloudinaryService cloudinaryService,
    IConfiguration configuration,
    ILogger<LogService> logger) : ILogService
{
    private readonly ICloudinaryService _cloudinaryService = cloudinaryService;
    private static readonly ConcurrentDictionary<string, AttemptState> AttemptTracker = new();
    private static readonly ConcurrentDictionary<string, MfaChallengeState> MfaChallenges = new();
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

        var mfaEnabled = bool.TryParse(configuration["MfaSettings:Enabled"], out var enabled) && enabled;
        var mfaCodeLength = int.TryParse(configuration["MfaSettings:CodeLength"], out var codeLength) ? codeLength : 6;
        var mfaExpiryMinutes = int.TryParse(configuration["MfaSettings:CodeExpiryMinutes"], out var expiryMins) ? expiryMins : 5;

        if (mfaEnabled)
        {
            var userMfaKey = $"mfa:{user.Id}";

            if (string.IsNullOrWhiteSpace(loginDto.MfaCode))
            {
                var code = GenerateNumericCode(mfaCodeLength);
                var expiresAt = DateTime.UtcNow.AddMinutes(mfaExpiryMinutes);

                MfaChallenges[userMfaKey] = new MfaChallengeState
                {
                    Code = code,
                    ExpiresAtUtc = expiresAt
                };

                await emailService.SendMfaCodeAsync(user.Email, user.Username, code, mfaExpiryMinutes);

                return new LogResponseDto
                {
                    Success = true,
                    RequiresMfa = true,
                    Message = "Se envió un código MFA a tu correo.",
                    UserDetails = MapToUserDetailsDto(user),
                    MfaExpiresAt = expiresAt
                };
            }

            if (!MfaChallenges.TryGetValue(userMfaKey, out var mfaChallenge) || mfaChallenge.ExpiresAtUtc <= DateTime.UtcNow)
            {
                MfaChallenges.TryRemove(userMfaKey, out _);
                throw new UnauthorizedAccessException("El código MFA expiró o no existe. Inicia sesión nuevamente.");
            }

            if (!string.Equals(mfaChallenge.Code, loginDto.MfaCode.Trim(), StringComparison.Ordinal))
            {
                throw new UnauthorizedAccessException("Código MFA inválido.");
            }

            MfaChallenges.TryRemove(userMfaKey, out _);
        }

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

    public Task LogoutAsync(string? jti, DateTime? expiresAtUtc)
    {
        if (string.IsNullOrWhiteSpace(jti))
        {
            throw new UnauthorizedAccessException("Token inválido: no contiene identificador (jti).");
        }

        tokenRevocationService.RevokeToken(jti, expiresAtUtc ?? DateTime.UtcNow.AddMinutes(60));
        return Task.CompletedTask;
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

    private static string GenerateNumericCode(int length)
    {
        var digits = new char[length];
        for (var index = 0; index < length; index++)
        {
            digits[index] = (char)('0' + RandomNumberGenerator.GetInt32(0, 10));
        }

        return new string(digits);
    }

    private class AttemptState
    {
        public int FailedAttempts { get; set; }
        public DateTime? LockedUntilUtc { get; set; }
    }

    private class MfaChallengeState
    {
        public string Code { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
    }
}

