using System;
using System.ComponentModel.DataAnnotations;
using LoginService.Domain.Entities;

namespace LoginService.Domain.Entities;

public class UserRole
{
    [Key]
    [MaxLength(16)]
    public  string Id {get; set;} = string.Empty;

    [Key]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    [Key]
    [MaxLength(16)]
    public string RoleId {get; set;} = string.Empty;

    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    public User User {get; set;} = null!;

    public Role Role {get; set;} = null!;
}