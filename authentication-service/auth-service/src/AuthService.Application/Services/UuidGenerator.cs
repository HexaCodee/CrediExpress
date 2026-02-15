using System.Security.Cryptography;
using System.Text;

namespace AuthService.Application.Services;

public static class UuidGenerator
{
    // Caracteres seguros (sin 0, O, I, l para evitar confusión)
    private static readonly string Alphabet = "123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";

    public static string GenerateShortUUID()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[12];
        rng.GetBytes(bytes);

        var result = new StringBuilder(12);
        for (int i = 0; i < 12; i++)
        {
            result.Append(Alphabet[bytes[i] % Alphabet.Length]);
        }

        return result.ToString();
    }

    public static string GenerateUserId()
    {
        return $"usr_{GenerateShortUUID()}";
    }

    public static string GenerateRoleId()
    {
        return $"rol_{GenerateShortUUID()}";
    }

    public static bool IsValidUserId(string? id)
    {
        if (string.IsNullOrEmpty(id))
            return false;

        // Debe empezar con usr_ y tener 16 caracteres en total (usr_ + 12 caracteres)
        if (id.Length != 16 || !id.StartsWith("usr_"))
            return false;

        var idPart = id[4..]; // Obtener solo la parte después de "usr_"
        return idPart.All(c => Alphabet.Contains(c));
    }
}
