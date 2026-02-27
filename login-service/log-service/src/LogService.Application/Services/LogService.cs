using LoginService.Application.DTOs;
using LoginService.Application.Interfaces;
using LoginService.Domain.Constants;
using LoginService.Domain.Entities;
using LoginService.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using LoginService.Application.Extensions;

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

    public async Task<LogResponseDto> LoginAsync(LoginDto loginDto)
    {
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
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Credenciales inválidas");
        }

        if (!user.Status)
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("La cuenta de usuario está deshabilitada");
        }

        if (!passwordHashService.VerifyPassword(loginDto.Password, user.Password))
        {
            logger.LogFailedLoginAttempt();
            throw new UnauthorizedAccessException("Credenciales inválidas");
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
}

