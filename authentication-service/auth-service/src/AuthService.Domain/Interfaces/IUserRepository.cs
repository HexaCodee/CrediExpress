using AuthService.Domain.Entities;

namespace AuthService.Domain.Interfaces;

public interface IUserRepository
{
    Task<User> CreateAsync(User user);
    Task<IReadOnlyList<User>> GetAllAsync();
    Task<User> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailVerificationTokenAsync(string token);
    Task<User?> GetByPasswordResetTokenAsync(string token);
    Task<bool> ExistsByEmailAsync(string email);
    Task<bool> ExistsByUsernameAsync(string username);
    Task<bool> ExistsByDpiAsync(string dpi);
    Task<bool> ExistsByAccountNumberAsync(string accountNumber);
    Task<User> UpdateAsync(User user);
    Task<bool> DeleteAsync(string id);
    Task UpdateUserRoleAsync(string userId, string roleId);
}