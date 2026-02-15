using AuthService.Domain.Entities;

namespace AuthService.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
