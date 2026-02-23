using System;
using LoginService.Application.DTOs;
using LoginService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace LoginService.Api.Controllers;

[ApiController]
[Route ("api/v1/[controller]")]
public class LogController(ILogService logService) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<LogResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await logService.LoginAsync(loginDto);
        return Ok(result);
    }
}
