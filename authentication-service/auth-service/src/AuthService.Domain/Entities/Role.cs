using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class Role
{
    [Key]
    [MaxLength(16)]
    public string Id { get; set;} = string.Empty;

    [Required(ErrorMessage = "El nombre del Rol es obligatorio.")]
    [MaxLength(35, ErrorMessage = "El nombre del Role no puede exceder los 35 caracteres")]
    public string Name { get; set;} = string.Empty;

    public DateTime CreatedAt { get; set;} = DateTime.UtcNow;

    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    //Relacion con otra entidad
    public ICollection<UserRole> UserRoles {get; set;} = [];
}