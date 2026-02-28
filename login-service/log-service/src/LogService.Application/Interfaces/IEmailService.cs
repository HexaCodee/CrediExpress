namespace LoginService.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailVerificationAsync(string email, string username, string token);
    Task SendPasswordResetAsync(string email, string username, string token);
    Task SendWelcomeEmailAsync(string email, string username);
    Task SendMfaCodeAsync(string email, string username, string code, int expiresInMinutes);
}
