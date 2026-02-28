using LoginService.Application.DTOs;

namespace LoginService.Application.Interfaces;

public interface ILogService
{
    Task<LogResponseDto> LoginAsync(LoginDto loginDto);
    Task LogoutAsync(string? jti, DateTime? expiresAtUtc);
}
