using System;
using LoginService.Application.Interfaces;
using LoginService.Application.Services;
using LoginService.Domain.Interfaces;
using LoginService.Persistence.Data;
using LoginService.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LoginService.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options => 
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
            .UseSnakeCaseNamingConvention());

        services.AddScoped<IUserRepository, UserRepository>();

        services.AddHealthChecks();
        return services;
    }

    public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        return services;
    }
}
