using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs.Email;

public class VerifyEmailDto
{
    [Required]
    public string Token { get; set; } = string.Empty;
}
