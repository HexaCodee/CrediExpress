using LoginService.Domain.Entities;

namespace LoginService.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
