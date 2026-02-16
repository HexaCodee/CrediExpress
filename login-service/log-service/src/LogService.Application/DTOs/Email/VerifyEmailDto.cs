using System.ComponentModel.DataAnnotations;

namespace LoginService.Application.DTOs.Email;

public class VerifyEmailDto
{
    [Required]
    public string Token { get; set; } = string.Empty;
}
