using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using AuthService.Application.DTOs.Email;
using AuthService.Application.Exceptions;
using AuthService.Application.Extensions;
using AuthService.Application.Validators;

namespace AuthService.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IRoleRepository roleRepository,
    IPasswordHashService passwordHashService,
    IJwtTokenService jwtTokenService,
    ICloudinaryService cloudinaryService,
    IEmailService emailService,
    ILogger<AuthService> logger) : IAuthService
{
    private readonly ICloudinaryService _cloudinaryService = cloudinaryService;

    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        if (await userRepository.ExistsByEmailAsync(registerDto.Email))
        {
            logger.LogRegistrationWithExistingEmail();
            throw new BusinessException(ErrorCodes.EMAIL_ALREADY_EXISTS, "El email ya existe");
        }

        if (await userRepository.ExistsByUsernameAsync(registerDto.Username))
        {
            logger.LogRegistrationWithExistingUsername();
            throw new BusinessException(ErrorCodes.USERNAME_ALREADY_EXISTS, "El nombre de usuario ya existe");
        }

        string profilePicturePath;

        if (registerDto.ProfilePicture != null && registerDto.ProfilePicture.Size > 0)
        {
            var (isValid, errorMessage) = FileValidator.ValidateImage(registerDto.ProfilePicture);
            if (!isValid)
            {
                logger.LogWarning($"Validación de archivo fallida: {errorMessage}");
                throw new BusinessException(ErrorCodes.INVALID_FILE_FORMAT, errorMessage!);
            }

            try
            {
                var fileName = FileValidator.GenerateSecureFileName(registerDto.ProfilePicture.FileName);
                profilePicturePath = await _cloudinaryService.UploadImageAsync(registerDto.ProfilePicture, fileName);
            }
            catch (Exception)
            {
                logger.LogImageUploadError();
                throw new BusinessException(ErrorCodes.IMAGE_UPLOAD_FAILED, "Error al subir la imagen de perfil");
            }
        }
        else
        {
            profilePicturePath = _cloudinaryService.GetDefaultAvatarUrl();
        }

        var emailVerificationToken = TokenGenerator.GenerateEmailVerificationToken();

        var userId = UuidGenerator.GenerateUserId();
        var userProfileId = UuidGenerator.GenerateUserId();
        var userEmailId = UuidGenerator.GenerateUserId();
        var userRoleId = UuidGenerator.GenerateUserId();
        var UserPasswordResetId = UuidGenerator.GenerateUserId();

        var defaultRole = await roleRepository.GetByNameAsync(RoleConstants.CLIENT);
        if (defaultRole == null)
        {
            throw new InvalidOperationException($"Rol por defecto '{RoleConstants.CLIENT}' no encontrado. Asegúrese de que la siembra se ejecute antes del registro.");
        }

        var user = new User
        {
            Id = userId,
            Name = registerDto.Name,
            Surname = registerDto.Surname,
            Username = registerDto.Username,
            Email = registerDto.Email.ToLowerInvariant(),
            Password = passwordHashService.HashPassword(registerDto.Password),
            Status = false,
            UserProfile = new UserProfile
            {
                Id = userProfileId,
                UserId = userId,
                ProfilePicture = profilePicturePath,
                Phone = registerDto.Phone
            },
            UserEmail = new UserEmail
            {
                Id = userEmailId,
                UserId = userId,
                EmailVerified = false,
                EmailVerificationToken = emailVerificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
            },
            UserRoles =
            [
                new Domain.Entities.UserRole
                {
                    Id = userRoleId,
                    UserId = userId,
                    RoleId = defaultRole.Id
                }
            ],
            UserPasswordReset = new UserPasswordReset
            {
                Id = UserPasswordResetId,
                UserId = userId,
                PasswordResetToken = null,
                PasswordResetTokenExpiry = null
            }
        };

        var createdUser = await userRepository.CreateAsync(user);

        logger.LogUserRegistered(createdUser.Username);

        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendEmailVerificationAsync(createdUser.Email, createdUser.Username, emailVerificationToken);
                logger.LogInformation("Email de verificación enviado");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error al enviar el email de verificación");
            }
        });

        return new RegisterResponseDto
        {
            Success = true,
            User = MapToUserResponseDto(createdUser),
            Message = "Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.",
            EmailVerificationRequired = true
        };
    }

    private UserResponseDto MapToUserResponseDto(User user)
    {
        var userRole = user.UserRoles.FirstOrDefault()?.Role?.Name ?? RoleConstants.CLIENT;
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = _cloudinaryService.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = userRole,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
    public async Task<EmailResponseDto> VerifyEmailAsync(VerifyEmailDto verifyEmailDto)
    {
        var user = await userRepository.GetByEmailVerificationTokenAsync(verifyEmailDto.Token);
        if (user == null || user.UserEmail == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Token de verificación inválido o expirado"
            };
        }

        user.UserEmail.EmailVerified = true;
        user.Status = true;
        user.UserEmail.EmailVerificationToken = null;
        user.UserEmail.EmailVerificationTokenExpiry = null;

        await userRepository.UpdateAsync(user);

        // Enviar email de bienvenida
        try
        {
            await emailService.SendWelcomeEmailAsync(user.Email, user.Username);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
        }

        logger.LogInformation("Email verified successfully for user {Username}", user.Username);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Email verificado exitosamente",
            Data = new
            {
                email = user.Email,
                verified = true
            }
        };
    }

    public async Task<EmailResponseDto> ResendVerificationEmailAsync(ResendVerificationDto resendDto)
    {
        var user = await userRepository.GetByEmailAsync(resendDto.Email);
        if (user == null || user.UserEmail == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Usuario no encontrado",
                Data = new { email = resendDto.Email, sent = false }
            };
        }

        if (user.UserEmail.EmailVerified)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "El email ya ha sido verificado",
                Data = new { email = user.Email, verified = true }
            };
        }

        // Generar nuevo token
        var newToken = TokenGenerator.GenerateEmailVerificationToken();
        user.UserEmail.EmailVerificationToken = newToken;
        user.UserEmail.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

        await userRepository.UpdateAsync(user);

        // Enviar email
        try
        {
            await emailService.SendEmailVerificationAsync(user.Email, user.Username, newToken);
            return new EmailResponseDto
            {
                Success = true,
                Message = "Email de verificación enviado exitosamente",
                Data = new { email = user.Email, sent = true }
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to resend verification email to {Email}", user.Email);
            return new EmailResponseDto
            {
                Success = false,
                Message = "Error al enviar el email de verificación",
                Data = new { email = user.Email, sent = false }
            };
        }
    }

    public async Task<EmailResponseDto> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        var user = await userRepository.GetByEmailAsync(forgotPasswordDto.Email);
        if (user == null)
        {
            // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
            return new EmailResponseDto
            {
                Success = true,
                Message = "Si el email existe, se ha enviado un enlace de recuperación",
                Data = new { email = forgotPasswordDto.Email, initiated = true }
            };
        }

        // Generar token de reset
        var resetToken = TokenGenerator.GeneratePasswordResetToken();

        if (user.UserPasswordReset == null)
        {
            user.UserPasswordReset = new UserPasswordReset
            {
                UserId = user.Id,
                PasswordResetToken = resetToken,
                PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1)
            };
        }
        else
        {
            user.UserPasswordReset.PasswordResetToken = resetToken;
            user.UserPasswordReset.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // 1 hora para resetear
        }

        await userRepository.UpdateAsync(user);

        // Enviar email
        try
        {
            await emailService.SendPasswordResetAsync(user.Email, user.Username, resetToken);
            logger.LogInformation("Password reset email sent to {Email}", user.Email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
        }

        return new EmailResponseDto
        {
            Success = true,
            Message = "Si el email existe, se ha enviado un enlace de recuperación",
            Data = new { email = forgotPasswordDto.Email, initiated = true }
        };
    }

    public async Task<EmailResponseDto> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        var user = await userRepository.GetByPasswordResetTokenAsync(resetPasswordDto.Token);
        if (user == null || user.UserPasswordReset == null)
        {
            return new EmailResponseDto
            {
                Success = false,
                Message = "Token de restablecimiento inválido o expirado",
                Data = new { token = resetPasswordDto.Token, reset = false }
            };
        }

        // Actualizar contraseña
        user.Password = passwordHashService.HashPassword(resetPasswordDto.NewPassword);
        user.UserPasswordReset.PasswordResetToken = null;
        user.UserPasswordReset.PasswordResetTokenExpiry = null;

        await userRepository.UpdateAsync(user);

        logger.LogInformation("Password reset successfully for user {Username}", user.Username);

        return new EmailResponseDto
        {
            Success = true,
            Message = "Contraseña actualizada exitosamente",
            Data = new { email = user.Email, reset = true }
        };
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(string userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        return MapToUserResponseDto(user);
    }
}

