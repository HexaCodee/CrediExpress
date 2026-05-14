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
        const string adminUsername = "adminb";
        const string adminEmail = "adminb@local.com";
        const string adminPassword = "adminb";

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
        if (adminRole == null)
        {
            return;
        }

        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Username == adminUsername || u.Email == adminEmail);
        var oldAdmin = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin" || u.Email == "admin@local.com");

        var passwordHasher = new PasswordHashService();

        // Remove old admin if exists
        if (oldAdmin != null)
        {
            context.Users.Remove(oldAdmin);
            await context.SaveChangesAsync();
        }

        // Remove new admin if already exists (to recreate it fresh)
        if (adminUser != null)
        {
            context.Users.Remove(adminUser);
            await context.SaveChangesAsync();
        }

        // Create fresh admin
        var userId = UuidGenerator.GenerateUserId();
        var profileId = UuidGenerator.GenerateUserId();
        var emailId = UuidGenerator.GenerateUserId();
        var userRoleId = UuidGenerator.GenerateUserId();

        var newAdmin = new User
        {
            Id = userId,
            Name = "Admin B",
            Surname = "Admin B",
            Username = adminUsername,
            Email = adminEmail,
            Password = passwordHasher.HashPassword(adminPassword),
            Status = true,
            UserProfile = new UserProfile
            {
                Id = profileId,
                UserId = userId,
                ProfilePicture = string.Empty,
                Phone = "00000000",
                AccountNumber = string.Empty,
                Dpi = string.Empty,
                Address = string.Empty,
                JobName = string.Empty,
                MonthlyIncome = 100
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

        await context.Users.AddAsync(newAdmin);
        await context.SaveChangesAsync();
    }
}
