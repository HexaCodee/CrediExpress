using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class UpdateUserByAdminDto
{
    [MaxLength(25)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? Surname { get; set; }

    [MinLength(3)]
    [MaxLength(25)]
    public string? Username { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(8, MinimumLength = 8)]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El teléfono debe contener exactamente 8 dígitos")]
    public string? Phone { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? JobName { get; set; }

    [Range(100, double.MaxValue, ErrorMessage = "Los ingresos mensuales deben ser como mínimo Q100")]
    public decimal? MonthlyIncome { get; set; }

    public bool? Status { get; set; }
}
