using System.ComponentModel.DataAnnotations;
using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

public class RegisterDto
{
    [Required]
    [MaxLength(25)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(25)]
    public string Surname { get; set; } = string.Empty;

    [Required]
    [MinLength(3)]
    [MaxLength(25)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(128)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$", ErrorMessage = "La contraseña debe incluir mayúscula, minúscula, número y carácter especial")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(8, MinimumLength = 8)]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El teléfono debe contener exactamente 8 dígitos")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{13}$", ErrorMessage = "El DPI debe contener exactamente 13 dígitos")]
    public string Dpi { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string JobName { get; set; } = string.Empty;

    [Range(100, double.MaxValue, ErrorMessage = "Los ingresos mensuales deben ser como mínimo Q100")]
    public decimal MonthlyIncome { get; set; }

    public IFileData? ProfilePicture { get; set; }
}
