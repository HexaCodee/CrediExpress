using System.ComponentModel.DataAnnotations;
using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

public class UpdateUserDto
{
    [MaxLength(25)]
    public string? Name { get; set; }

    [MaxLength(25)]
    public string? Surname { get; set; }

    [MinLength(3)]
    [MaxLength(25)]
    public string? Username { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [MinLength(8)]
    [MaxLength(128)]
    public string? Password { get; set; }

    [StringLength(8, MinimumLength = 8)]
    [RegularExpression(@"^[0-9]{8}$", ErrorMessage = "El teléfono debe contener exactamente 8 dígitos")]
    public string? Phone { get; set; }

    public string? Role { get; set; }

    public bool? Status { get; set; }

    public IFileData? ProfilePicture { get; set; }
}
