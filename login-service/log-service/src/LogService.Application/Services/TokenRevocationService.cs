using System.Collections.Concurrent;
using LoginService.Application.Interfaces;

namespace LoginService.Application.Services;

public class TokenRevocationService : ITokenRevocationService
{
    private static readonly ConcurrentDictionary<string, DateTime> RevokedTokens = new();

    public void RevokeToken(string jti, DateTime expiresAtUtc)
    {
        RevokedTokens[jti] = expiresAtUtc;
    }

    public bool IsRevoked(string jti)
    {
        CleanupExpiredEntries();

        if (!RevokedTokens.TryGetValue(jti, out var expiresAtUtc))
        {
            return false;
        }

        return expiresAtUtc > DateTime.UtcNow;
    }

    private static void CleanupExpiredEntries()
    {
        var now = DateTime.UtcNow;
        foreach (var entry in RevokedTokens)
        {
            if (entry.Value <= now)
            {
                RevokedTokens.TryRemove(entry.Key, out _);
            }
        }
    }
}
