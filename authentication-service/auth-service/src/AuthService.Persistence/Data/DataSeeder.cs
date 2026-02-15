using System;
using AuthService.Domain.Entities;
using AuthService.Application.Services;
using AuthService.Domain.Constants;
using Microsoft.EntityFrameworkCore;
namespace AuthService.Persistence.Data;

public class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (!context.Roles.Any())
        {
            var roles = new List<Role>
            {
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.BANK_ADMIN,
                },
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.CLIENT
                },
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.CASHIER
                }
            };

            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();
        }

        if(!await context.Users.AnyAsync())
        {
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.BANK_ADMIN);
            if(adminRole != null)
            {
                var passwordHasher = new PasswordHashService();
                var userId = UuidGenerator.GenerateUserId();
                var profileId = UuidGenerator.GenerateUserId();
                var emailId = UuidGenerator.GenerateUserId();
                var userRoleId = UuidGenerator.GenerateUserId();

                var adminUser = new User
                {
                    Id = userId,
                    Name = "Admin Name",
                    Surname = "Admin Surname",
                    Username = "admin",
                    Email = "admin@local.com",
                    Password = passwordHasher.HashPassword("Informatica2026?"),
                    Status = true,

                    UserProfile = new UserProfile
                    {
                        Id = profileId,
                        UserId = userId,
                        ProfilePicture = string.Empty,
                        Phone = "00000000"
                    },

                    UserEmail = new UserEmail
                    {
                        Id = emailId,
                        UserId = userId,
                        EmailVerified = true,
                        EmailVerificationToken = null,
                        EmailVerificationTokenExpiry = null
                    },

                    UserRoles =
                    [
                        new UserRole
                        {
                            Id = userRoleId,
                            UserId = userId,
                            RoleId = adminRole.Id    
                        }
                    ]
                };
                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
