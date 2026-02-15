using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class User
{
    [Key]
    [MaxLength(16)]
    public String Id {get; set;} = string.Empty; //Id de usuario

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(25, ErrorMessage = "El nombre no puede tener mas de 25 caracteres")]
    public String Name {get; set;} = string.Empty;  //Nombre Real de usuario

    [Required(ErrorMessage = "El apellido es obligatorio")]
    [MaxLength(50, ErrorMessage = "El apellido no puede tener mas de 50 caracteres")]
    public string Surname {get; set;} = string.Empty; //Apellido Real de usuario

    [Required(ErrorMessage = "El username es obligatorio")]
    [MaxLength(25, ErrorMessage = "El username no puede tener mas de 25 caracteres")]
    public string Username {get; set;} = string.Empty; //Nombre como alias del usuario 

    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El email no tiene el formato correcto")]
    [MaxLength(150, ErrorMessage = "El email no puede tener mas de 150 caracteres")]
    public string Email {get; set;} = string.Empty; //Email de usuario

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [MaxLength(255, ErrorMessage = "La contraseña no puede tener mas de 50 caracteres")]
    public string Password {get; set;} = string.Empty; //Contraseña de usuario

    public bool Status {get; set;} =  false;//Estado de usuario (Inactivo por default)

    //Fechas importantes
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    //Relaciones con otras entidades
    public ICollection<UserRole> UserRoles {get; set;} = [];

    public UserProfile UserProfile {get; set;} = null!;

    public UserEmail UserEmail {get; set;} = null!;

    public UserPasswordReset UserPasswordReset {get; set;} = null!;
}