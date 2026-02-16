using System;
using LoginService.Application.DTOs;
using LoginService.Application.DTOs.Email;
using LoginService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.VisualBasic;

namespace LoginService.Api.Controllers;

[ApiController]
[Route ("api/v1/[controller]")]
public class LogController(ILogService logService) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<LogResponseDto>> LoginI([FromBody] LoginDto loginDto)
    {
        var result = await logService.LoginAsync(loginDto);
        return Ok(result);
    }

    [HttpPost("register")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromForm] RegisterDto registerDto)
    {
        var result = await logService.RegisterAsync(registerDto);
        return StatusCode(201, result);
    }

    [HttpPost("verify-email")]
    [EnableRateLimiting("ApiPolicy")]

    public async Task<ActionResult<EmailResponseDto>> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await logService.VerifyEmailAsync(verifyEmailDto);
        return Ok(result);
    }
}
