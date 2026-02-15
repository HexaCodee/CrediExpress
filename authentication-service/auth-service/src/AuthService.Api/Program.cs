using AuthService.Api.Extensions;
using AuthService.Api.Middlewares;
using AuthService.Api.ModelBinders;
using AuthService.Persistence.Data;
using NetEscapades.AspNetCore.SecurityHeaders.Infrastructure;
using Serilog;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;

var builder = WebApplication.CreateBuilder(args);

// CORRECCIÓN: Omitir validación SSL (Cloudinary, etc.)
System.Net.ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, sslPolicyErrors) => true;

// Configure Serilog from appsettings.json only (avoid duplicate sinks)
builder.Host.UseSerilog((context, services, loggerConfiguration) =>
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services));

// Add services to the container
builder.Services.AddControllers(options =>
{
    // Agregar el enlazador de modelos para IFileData
    options.ModelBinderProviders.Insert(0, new FileDataModelBinderProvider());
})
.AddJsonOptions(o =>
{
    // Estandarizar respuestas en camelCase para coincidir con auth-node
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// Configure services through extension methods
builder.Services.AddApiDocumentation();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddRateLimitingPolicies();

// Add security services
builder.Services.AddSecurityPolicies(builder.Configuration);
builder.Services.AddSecurityOptions();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add Serilog request logging
app.UseSerilogRequestLogging();

// Add Security Headers using NetEscapades package
app.UseSecurityHeaders(policies => policies
    .AddDefaultSecurityHeaders()
    .RemoveServerHeader()
    .AddFrameOptionsDeny()
    .AddXssProtectionBlock()
    .AddContentTypeOptionsNoSniff()
    .AddReferrerPolicyStrictOriginWhenCrossOrigin()
    .AddContentSecurityPolicy(builder =>
    {
        builder.AddDefaultSrc().Self();
        builder.AddScriptSrc().Self().UnsafeInline();
        builder.AddStyleSrc().Self().UnsafeInline();
        builder.AddImgSrc().Self().Data();
        builder.AddFontSrc().Self().Data();
        builder.AddConnectSrc().Self();
        builder.AddFrameAncestors().None();
        builder.AddBaseUri().Self();
        builder.AddFormAction().Self();
    })
    .AddCustomHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
    .AddCustomHeader("Cache-Control", "no-store, no-cache, must-revalidate, private")
);

// Manejo global de excepciones
app.UseMiddleware<GlobalExceptionMiddleware>();

// Middlewares principales
app.UseHttpsRedirection();
app.UseCors("DefaultCorsPolicy");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Log de inicio: direcciones y endpoint de salud
var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        var server = app.Services.GetRequiredService<IServer>();
        var addressesFeature = server.Features.Get<IServerAddressesFeature>();
        var addresses = (IEnumerable<string>?)addressesFeature?.Addresses ?? app.Urls;

        if (addresses != null && addresses.Any())
        {
            foreach (var addr in addresses)
            {
                var health = $"{addr.TrimEnd('/')}/api/v1/health";
                startupLogger.LogInformation("API de AuthService está ejecutándose en {Url}. Endpoint de salud: {HealthUrl}", addr, health);
            }
        }
        else
        {
            startupLogger.LogInformation("API de AuthService iniciada. Endpoint de salud: /api/v1/health");
        }
    }
    catch (Exception ex)
    {
        startupLogger.LogWarning(ex, "Fallo al determinar las direcciones de escucha para el log de inicio");
    }
});

// Inicializar base de datos y datos semilla
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Verificando conexión a la base de datos...");

        // Garantizar que la base de datos se crea (similar a Sequelize sync en Node.js)
        await context.Database.EnsureCreatedAsync();

        logger.LogInformation("Base de datos lista. Ejecutando datos semilla...");
        await DataSeeder.SeedAsync(context);

        logger.LogInformation("Inicialización de base de datos completada exitosamente");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Ocurrió un error al inicializar la base de datos");
        throw; // Relanzar para detener la aplicación
    }
}

app.Run();
