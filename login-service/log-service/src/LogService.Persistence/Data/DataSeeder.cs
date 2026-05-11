using System;
using LoginService.Domain.Entities;
using LoginService.Domain.Constants;
using LoginService.Application.Services;
using Microsoft.EntityFrameworkCore;
namespace LoginService.Persistence.Data;

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

        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.BANK_ADMIN);
        if (adminRole != null)
        {
            var passwordHasher = new PasswordHashService();
            var adminUser = await context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.UserEmail)
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Username == "ADMINB" || u.Email == "admin@local.com");

            if (adminUser == null && !await context.Users.AnyAsync())
            {
                var userId = UuidGenerator.GenerateUserId();
                var profileId = UuidGenerator.GenerateUserId();
                var emailId = UuidGenerator.GenerateUserId();
                var userRoleId = UuidGenerator.GenerateUserId();

                adminUser = new User
                {
                    Id = userId,
                    Name = "Admin Name",
                    Surname = "Admin Surname",
                    Username = "ADMINB",
                    Email = "admin@local.com",
                    Password = passwordHasher.HashPassword("ADMINB"),
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
            }
            else if (adminUser != null)
            {
                adminUser.Username = "ADMINB";
                adminUser.Password = passwordHasher.HashPassword("ADMINB");
                adminUser.Status = true;

                if (adminUser.UserEmail != null)
                {
                    adminUser.UserEmail.EmailVerified = true;
                }

                if (!adminUser.UserRoles.Any(r => r.RoleId == adminRole.Id))
                {
                    adminUser.UserRoles.Add(new UserRole
                    {
                        Id = UuidGenerator.GenerateUserId(),
                        UserId = adminUser.Id,
                        RoleId = adminRole.Id
                    });
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
