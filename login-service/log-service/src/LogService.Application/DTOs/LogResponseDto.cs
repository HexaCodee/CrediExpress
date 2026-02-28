namespace LoginService.Application.DTOs;

public class LogResponseDto
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public bool RequiresMfa { get; set; }
    public string Token { get; set; } = string.Empty;
    // Compact user details for clients
    public UserDetailsDto UserDetails { get; set; } = new();
    public DateTime ExpiresAt { get; set; }
    public DateTime? MfaExpiresAt { get; set; }
}
