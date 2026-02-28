using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IUserManagementService
{
    Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName);
    Task<IReadOnlyList<string>> GetUserRolesAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName);
    Task<IReadOnlyList<UserResponseDto>> GetManageableUsersAsync(string requesterUserId);
    Task<UserResponseDto> GetManageableUserByIdAsync(string requesterUserId, string targetUserId);
    Task<UserResponseDto> UpdateUserByAdminAsync(string requesterUserId, string targetUserId, UpdateUserByAdminDto updateDto);
    Task DeleteUserByAdminAsync(string requesterUserId, string targetUserId);
}
