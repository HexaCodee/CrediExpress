using System.Collections.Generic;
using System.Linq;
using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/auth/users")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IPasswordHashService _passwordHashService;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IPasswordHashService passwordHashService,
        ICloudinaryService cloudinaryService,
        ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _passwordHashService = passwordHashService;
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetAll()
    {
        var users = await _userRepository.GetAllAsync();
        var response = users.Select(user => MapToUserResponseDto(user)).ToList();
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserResponseDto>> Update(string id, [FromForm] UpdateUserDto updateDto)
    {
        User user;
        try
        {
            user = await _userRepository.GetByIdAsync(id);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }

        if (Request.Form.TryGetValue("status", out var statusValues) && statusValues.Count > 0)
        {
            var statusString = statusValues[0];
            if (bool.TryParse(statusString, out var statusValue))
            {
                user.Status = statusValue;
                _logger.LogInformation("Updating user {UserId} status to {Status}", id, user.Status);
            }
        }

        if (!string.IsNullOrWhiteSpace(updateDto.Email) && !string.Equals(user.Email, updateDto.Email, StringComparison.OrdinalIgnoreCase))
        {
            if (await _userRepository.ExistsByEmailAsync(updateDto.Email))
            {
                return Conflict(new { message = "El email ya está en uso" });
            }
            user.Email = updateDto.Email.Trim();
        }

        if (!string.IsNullOrWhiteSpace(updateDto.Username) && !string.Equals(user.Username, updateDto.Username, StringComparison.OrdinalIgnoreCase))
        {
            if (await _userRepository.ExistsByUsernameAsync(updateDto.Username))
            {
                return Conflict(new { message = "El nombre de usuario ya está en uso" });
            }
            user.Username = updateDto.Username.Trim();
        }

        if (!string.IsNullOrWhiteSpace(updateDto.Name))
        {
            user.Name = updateDto.Name.Trim();
        }

        if (!string.IsNullOrWhiteSpace(updateDto.Surname))
        {
            user.Surname = updateDto.Surname.Trim();
        }

        if (!string.IsNullOrWhiteSpace(updateDto.Password))
        {
            user.Password = _passwordHashService.HashPassword(updateDto.Password);
        }

        if (user.UserProfile == null)
        {
            _logger.LogWarning("User {UserId} has no UserProfile during update", id);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(updateDto.Phone))
            {
                user.UserProfile.Phone = updateDto.Phone.Trim();
            }

            if (updateDto.ProfilePicture != null)
            {
                user.UserProfile.ProfilePicture = await _cloudinaryService.UploadImageAsync(updateDto.ProfilePicture, $"user_{user.Id}_{DateTime.UtcNow.Ticks}");
            }

            user.UserProfile.UpdatedAt = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(updateDto.Role))
        {
            var requestedRole = ConvertRoleName(updateDto.Role);
            if (requestedRole == null)
            {
                return BadRequest(new { message = "Rol inválido" });
            }

            if (!user.UserRoles.Any(ur => string.Equals(ur.Role?.Name, requestedRole, StringComparison.OrdinalIgnoreCase)))
            {
                var roleEntity = await _roleRepository.GetByNameAsync(requestedRole);
                if (roleEntity == null)
                {
                    return BadRequest(new { message = "Rol no encontrado" });
                }

                await _userRepository.UpdateUserRoleAsync(user.Id, roleEntity.Id);
            }
        }

        var updatedUser = await _userRepository.UpdateAsync(user);
        return Ok(MapToUserResponseDto(updatedUser));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var deleted = await _userRepository.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private static string? ConvertRoleName(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return null;
        }

        return role.Trim().ToUpperInvariant() switch
        {
            "ADMIN_ROLE" => RoleConstants.BANK_ADMIN,
            "USER_ROLE" => RoleConstants.CLIENT,
            _ => role.Trim().ToUpperInvariant()
        };
    }

    private UserResponseDto MapToUserResponseDto(Domain.Entities.User user)
    {
        var roleName = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.CLIENT;
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = _cloudinaryService.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            AccountNumber = user.UserProfile?.AccountNumber ?? string.Empty,
            Dpi = user.UserProfile?.Dpi ?? string.Empty,
            Address = user.UserProfile?.Address ?? string.Empty,
            JobName = user.UserProfile?.JobName ?? string.Empty,
            MonthlyIncome = user.UserProfile?.MonthlyIncome ?? 0,
            Role = NormalizeRoleName(roleName),
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    private static string NormalizeRoleName(string role)
        => role switch
        {
            RoleConstants.BANK_ADMIN => "ADMIN_ROLE",
            RoleConstants.CLIENT => "USER_ROLE",
            _ => role
        };
}
