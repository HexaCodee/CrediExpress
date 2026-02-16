using LoginService.Application.DTOs;
using LoginService.Application.DTOs.Email;

namespace LoginService.Application.Interfaces;

public interface ILogService
{
    Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<LogResponseDto> LoginAsync(LoginDto loginDto);
    Task<EmailResponseDto> VerifyEmailAsync(VerifyEmailDto verifyEmailDto);
    Task<EmailResponseDto> ResendVerificationEmailAsync(ResendVerificationDto resendDto);
    Task<EmailResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<EmailResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<UserResponseDto?> GetUserByIdAsync(string userId);
}
