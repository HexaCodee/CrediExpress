using System.ComponentModel.DataAnnotations;

namespace LoginService.Application.DTOs;

public class LoginDto
{
    [Required]
    [MinLength(3)]
    [MaxLength(150)]
    public string EmailOrUsername { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(128)]
    public string Password { get; set; } = string.Empty;
}
