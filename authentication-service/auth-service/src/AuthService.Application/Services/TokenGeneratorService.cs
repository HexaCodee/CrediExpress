using System.Security.Cryptography;

namespace AuthService.Application.Services;

public static class TokenGenerator
{
    public static string GenerateEmailVerificationToken()
    {
        return GenerateSecureToken(32); // 32 bytes = 256 bits
    }

    public static string GeneratePasswordResetToken()
    {
        return GenerateSecureToken(32); // 32 bytes = 256 bits
    }

    private static string GenerateSecureToken(int length)
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[length];
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }
}
