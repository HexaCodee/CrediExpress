using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class UserManagementService(IUserRepository users, IRoleRepository roles) : IUserManagementService
{
    private static bool IsAdmin(User user) => user.UserRoles.Any(r => r.Role.Name == RoleConstants.BANK_ADMIN);

    private static UserResponseDto MapToUserResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            Phone = user.UserProfile?.Phone ?? string.Empty,
            AccountNumber = user.UserProfile?.AccountNumber ?? string.Empty,
            Dpi = user.UserProfile?.Dpi ?? string.Empty,
            Address = user.UserProfile?.Address ?? string.Empty,
            JobName = user.UserProfile?.JobName ?? string.Empty,
            MonthlyIncome = user.UserProfile?.MonthlyIncome ?? 0,
            Role = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.CLIENT,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    private async Task<User> EnsureManageableTargetAsync(string requesterUserId, string targetUserId)
    {
        var requester = await users.GetByIdAsync(requesterUserId);
        if (!IsAdmin(requester))
        {
            throw new UnauthorizedAccessException("Solo un administrador puede gestionar usuarios");
        }

        var target = await users.GetByIdAsync(targetUserId);
        if (target.Id != requesterUserId && IsAdmin(target))
        {
            throw new InvalidOperationException("No se puede administrar otro usuario administrador");
        }

        return target;
    }

    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        // Normalize
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        // Validate inputs
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));
        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException($"Role not allowed. Use {RoleConstants.BANK_ADMIN} or {RoleConstants.CLIENT}");

        // Load user with roles
        var user = await users.GetByIdAsync(userId);

        // If demoting an admin, prevent removing last admin
        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.BANK_ADMIN);
        if (isUserAdmin && roleName != RoleConstants.BANK_ADMIN)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.BANK_ADMIN);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last administrator");
            }
        }

        var isUserCashier= user.UserRoles.Any(r => r.Role.Name == RoleConstants.CASHIER);
        if (isUserCashier && roleName != RoleConstants.CASHIER)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.CASHIER);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last cashier");
            }
        }

        // Find role entity
        var role = await roles.GetByNameAsync(roleName)
                       ?? throw new InvalidOperationException($"Role {roleName} not found");

        // Update role using repository method
        await users.UpdateUserRoleAsync(userId, role.Id);

        // Reload user with updated roles
        user = await users.GetByIdAsync(userId);

        // Map to response
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = role.Name,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNamesAsync(userId);
        return roleNames;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);
        return usersInRole.Select(u => new UserResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Surname = u.Surname,
            Username = u.Username,
            Email = u.Email,
            Phone = u.UserProfile?.Phone ?? string.Empty,
            Role = roleName,
            Status = u.Status,
            IsEmailVerified = u.UserEmail?.EmailVerified ?? false,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt
        }).ToList();
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetManageableUsersAsync(string requesterUserId)
    {
        var requester = await users.GetByIdAsync(requesterUserId);
        if (!IsAdmin(requester))
        {
            throw new UnauthorizedAccessException("Solo un administrador puede gestionar usuarios");
        }

        var allUsers = await users.GetAllAsync();
        return allUsers
            .Where(u => u.Id == requesterUserId || !IsAdmin(u))
            .Select(MapToUserResponse)
            .ToList();
    }

    public async Task<UserResponseDto> GetManageableUserByIdAsync(string requesterUserId, string targetUserId)
    {
        var target = await EnsureManageableTargetAsync(requesterUserId, targetUserId);
        return MapToUserResponse(target);
    }

    public async Task<UserResponseDto> UpdateUserByAdminAsync(string requesterUserId, string targetUserId, UpdateUserByAdminDto updateDto)
    {
        var target = await EnsureManageableTargetAsync(requesterUserId, targetUserId);

        if (!string.IsNullOrWhiteSpace(updateDto.Name)) target.Name = updateDto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(updateDto.Surname)) target.Surname = updateDto.Surname.Trim();
        if (!string.IsNullOrWhiteSpace(updateDto.Username)) target.Username = updateDto.Username.Trim();
        if (!string.IsNullOrWhiteSpace(updateDto.Email)) target.Email = updateDto.Email.Trim().ToLowerInvariant();
        if (updateDto.Status.HasValue) target.Status = updateDto.Status.Value;

        if (target.UserProfile != null)
        {
            if (!string.IsNullOrWhiteSpace(updateDto.Phone)) target.UserProfile.Phone = updateDto.Phone.Trim();
            if (!string.IsNullOrWhiteSpace(updateDto.Address)) target.UserProfile.Address = updateDto.Address.Trim();
            if (!string.IsNullOrWhiteSpace(updateDto.JobName)) target.UserProfile.JobName = updateDto.JobName.Trim();
            if (updateDto.MonthlyIncome.HasValue) target.UserProfile.MonthlyIncome = updateDto.MonthlyIncome.Value;
            target.UserProfile.UpdatedAt = DateTime.UtcNow;
        }

        target.UpdatedAt = DateTime.UtcNow;
        var updated = await users.UpdateAsync(target);
        return MapToUserResponse(updated);
    }

    public async Task DeleteUserByAdminAsync(string requesterUserId, string targetUserId)
    {
        await EnsureManageableTargetAsync(requesterUserId, targetUserId);
        await users.DeleteAsync(targetUserId);
    }
}
