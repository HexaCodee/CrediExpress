using System;
using System.Security.Cryptography;
using LoginService.Domain.Entities;
using LoginService.Domain.Constants;
using LoginService.Application.Services;
using Microsoft.EntityFrameworkCore;
namespace LoginService.Persistence.Data;

public class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        const string adminUsername = "ADMINB";
        const string adminEmail = "ADMINB@gmail.com";
        const string adminPassword = "ADMINB";

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

        var adminUser = await context.Users.FirstOrDefaultAsync(u => EF.Functions.ILike(u.Username, adminUsername) || EF.Functions.ILike(u.Email, adminEmail));
        var oldAdmin = await context.Users.FirstOrDefaultAsync(u => EF.Functions.ILike(u.Username, "admin") || EF.Functions.ILike(u.Email, "admin@gmail.com"));

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
            Name = "AdminB",
            Surname = "AdminB",
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
                Dpi = await GenerateUniqueNumericCodeAsync(context, 13),
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

    private static async Task<string> GenerateUniqueNumericCodeAsync(ApplicationDbContext context, int length)
    {
        while (true)
        {
            var digits = new char[length];

            for (var index = 0; index < length; index++)
            {
                digits[index] = (char)('0' + RandomNumberGenerator.GetInt32(0, 10));
            }

            var dpi = new string(digits);
            var exists = await context.UserProfiles.AnyAsync(userProfile => userProfile.Dpi == dpi);

            if (!exists)
            {
                return dpi;
            }
        }
    }
}