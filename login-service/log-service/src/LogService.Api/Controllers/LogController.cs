using System;
using LoginService.Application.DTOs;
using LoginService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.IdentityModel.Tokens.Jwt;

namespace LoginService.Api.Controllers;

[ApiController]
[Route ("api/v1/[controller]")]
[Produces("application/json")]
public class LogController(ILogService logService) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(LogResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<LogResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await logService.LoginAsync(loginDto);
        return Ok(result);
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<object>> Logout()
    {
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        var expClaim = User.FindFirst(JwtRegisteredClaimNames.Exp)?.Value;

        DateTime? expiresAtUtc = null;
        if (long.TryParse(expClaim, out var expUnix))
        {
            expiresAtUtc = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;
        }

        await logService.LogoutAsync(jti, expiresAtUtc);
        return Ok(new { success = true, message = "Logout exitoso" });
    }
}
