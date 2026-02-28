namespace LoginService.Application.Interfaces;

public interface ITokenRevocationService
{
    void RevokeToken(string jti, DateTime expiresAtUtc);
    bool IsRevoked(string jti);
}
