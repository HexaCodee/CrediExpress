using System;
using System.Linq;
using System.Security.Cryptography;
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

        var adminUser = await context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Username == adminUsername || u.Email == adminEmail);
        var oldAdmin = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin" || u.Email == "admin@local.com");

        var passwordHasher = new PasswordHashService();

        if (adminUser == null && oldAdmin != null)
        {
            adminUser = oldAdmin;
        }
        else if (oldAdmin != null && adminUser != null && oldAdmin.Id != adminUser.Id)
        {
            context.Users.Remove(oldAdmin);
        }

        if (adminUser == null)
        {
            var userId = UuidGenerator.GenerateUserId();
            var profileId = UuidGenerator.GenerateUserId();
            var emailId = UuidGenerator.GenerateUserId();
            var userRoleId = UuidGenerator.GenerateUserId();

            adminUser = new User
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
                    AccountNumber = UuidGenerator.GenerateShortUUID(),
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

            await context.Users.AddAsync(adminUser);
        }
        else
        {
            adminUser.Name = "Admin B";
            adminUser.Surname = "Admin B";
            adminUser.Username = adminUsername;
            adminUser.Email = adminEmail;
            adminUser.Password = passwordHasher.HashPassword(adminPassword);
            adminUser.Status = true;

            adminUser.UserProfile ??= new UserProfile
            {
                Id = UuidGenerator.GenerateUserId(),
                UserId = adminUser.Id,
                ProfilePicture = string.Empty,
                Phone = "00000000",
                AccountNumber = UuidGenerator.GenerateShortUUID(),
                Dpi = await GenerateUniqueNumericCodeAsync(context, 13),
                Address = string.Empty,
                JobName = string.Empty,
                MonthlyIncome = 100
            };

            if (string.IsNullOrEmpty(adminUser.UserProfile.AccountNumber))
            {
                adminUser.UserProfile.AccountNumber = UuidGenerator.GenerateShortUUID();
            }

            if (string.IsNullOrEmpty(adminUser.UserProfile.Dpi))
            {
                adminUser.UserProfile.Dpi = await GenerateUniqueNumericCodeAsync(context, 13);
            }

            adminUser.UserEmail ??= new UserEmail
            {
                Id = UuidGenerator.GenerateUserId(),
                UserId = adminUser.Id,
                EmailVerified = true
            };
            adminUser.UserEmail.EmailVerified = true;

            if (!adminUser.UserRoles.Any(userRole => userRole.RoleId == adminRole.Id))
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
