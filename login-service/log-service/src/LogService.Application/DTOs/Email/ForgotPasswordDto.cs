using System.ComponentModel.DataAnnotations;

namespace LoginService.Application.DTOs.Email;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
