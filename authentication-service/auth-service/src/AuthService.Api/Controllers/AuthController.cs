using System;
using AuthService.Application.DTOs;
using AuthService.Application.DTOs.Email;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService authService, IUserManagementService userManagementService) : ControllerBase
{
    private bool IsAdminRequest()
    {
        var role = User.FindFirst("role")?.Value;
        return string.Equals(role, "BANK_ADMIN", StringComparison.OrdinalIgnoreCase);
    }

    [HttpPost("register")]
    [Authorize]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromForm] RegisterDto registerDto)
    {
        if (!IsAdminRequest())
        {
            return Forbid();
        }

        var result = await authService.RegisterAsync(registerDto);
        return StatusCode(201, result);
    }

    [HttpPost("admin/register-client")]
    [Authorize]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<RegisterResponseDto>> RegisterClientByAdmin([FromForm] RegisterDto registerDto)
    {
        if (!IsAdminRequest())
        {
            return Forbid();
        }

        var result = await authService.RegisterAsync(registerDto);
        return StatusCode(201, result);
    }

    [HttpPost("admin/register-admin")]
    [Authorize]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<RegisterResponseDto>> RegisterAdminByAdmin([FromForm] RegisterDto registerDto)
    {
        if (!IsAdminRequest())
        {
            return Forbid();
        }

        var registerResponse = await authService.RegisterAsync(registerDto);
        await userManagementService.UpdateUserRoleAsync(registerResponse.User.Id, "BANK_ADMIN");
        registerResponse.User.Role = "BANK_ADMIN";

        return StatusCode(201, registerResponse);
    }

    [HttpGet("admin/users")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetManageableUsers()
    {
        if (!IsAdminRequest())
        {
            return Forbid();
        }

        var requesterUserId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(requesterUserId))
        {
            return Unauthorized();
        }

        var users = await userManagementService.GetManageableUsersAsync(requesterUserId);
        return Ok(users);
    }

    [HttpGet("admin/users/{userId}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> GetManageableUserById([FromRoute] string userId)
    {
        if (!IsAdminRequest())
        {
            return Forbid();
        }

        var requesterUserId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(requesterUserId))
        {
            return Unauthorized();
        }

        var user = await userManagementService.GetManageableUserByIdAsync(requesterUserId, userId);
        return Ok(user);
    }

    [HttpPut("admin/users/{userId}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> UpdateUserByAdmin([FromRoute] string userId, [FromBody] UpdateUserByAdminDto updateDto)
    {
        if (!IsAdminRequest())
        {
            return Forbid();
        }

        var requesterUserId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(requesterUserId))
        {
            return Unauthorized();
        }

        var user = await userManagementService.UpdateUserByAdminAsync(requesterUserId, userId, updateDto);
        return Ok(user);
    }

    [HttpDelete("admin/users/{userId}")]
    [Authorize]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<object>> DeleteUserByAdmin([FromRoute] string userId)
    {
        if (!IsAdminRequest())
        {
            return Forbid();
        }

        var requesterUserId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(requesterUserId))
        {
            return Unauthorized();
        }

        await userManagementService.DeleteUserByAdminAsync(requesterUserId, userId);
        return Ok(new { success = true, message = "Usuario eliminado" });
    }

    [HttpPost("verify-email")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<EmailResponseDto>> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await authService.VerifyEmailAsync(verifyEmailDto);
        return Ok(result);
    }

    [HttpGet("verify-email")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<EmailResponseDto>> VerifyEmailFromLink([FromQuery] string token)
    {
        var result = await authService.VerifyEmailAsync(new VerifyEmailDto { Token = token });
        return Ok(result);
    }

    [HttpPost("resend-verification")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<EmailResponseDto>> ResendVerification([FromBody] ResendVerificationDto resendDto)
    {
        var result = await authService.ResendVerificationEmailAsync(resendDto);
        return Ok(result);
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<EmailResponseDto>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var result = await authService.ForgotPasswordAsync(forgotPasswordDto);
        return Ok(result);
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<EmailResponseDto>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        var result = await authService.ResetPasswordAsync(resetPasswordDto);
        return Ok(result);
    }
}
