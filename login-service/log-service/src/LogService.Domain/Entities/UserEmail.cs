using System;
using System.ComponentModel.DataAnnotations;

namespace LoginService.Domain.Entities;

public class UserEmail
{
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    [Key]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    [Required]
    public bool EmailVerified {get; set;} = false;

    [MaxLength(255)]
    public string? EmailVerificationToken {get; set;}

    public DateTime? EmailVerificationTokenExpiry {get; set;}

    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    public User User {get; set;} = null!;
}