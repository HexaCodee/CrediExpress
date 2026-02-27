using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class UserProfile
{
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    [Key]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    [MaxLength(255)]
    public string ProfilePicture {get; set;} = string.Empty;

    [StringLength(8, MinimumLength =8, ErrorMessage = "El teléfono debe tener 8 dígitos exactos.")]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El teléfono debe contener solo números.")]
    public string Phone {get; set;} = string.Empty;

    [Required]
    [MaxLength(20)]
    public string AccountNumber { get; set; } = string.Empty;

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

    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    public User User {get; set;} = null!;
}