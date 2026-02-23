# Español
# SistemaBancario

Sistema bancario seguro de arquitectura full-stack para la gestión de cuentas, procesamiento de transacciones y manejo de conversión de divisas. Desarrollado utilizando React, Node.js, .NET y Docker bajo el marco ágil SCRUM, garantizando una sólida seguridad, escalabilidad y operaciones de alto rendimiento.

## Funcionalidades Principales

### Autenticación y Autorización

* Registro de clientes
* Inicio de sesión con JWT
* Autenticación Multifactor (MFA) opcional
* Protección de rutas con JWT Bearer Authentication
* Sistema de roles
* Control de acceso basado en roles
* Cierre de sesión seguro
* Bloqueo de cuenta por intentos fallidos

---

### Gestión de Clientes

* Creación y actualización de perfiles de cliente
* Consulta de cliente por ID
* Perfiles de usuario con foto (Cloudinary)
* Activación / desactivación de cuentas
* Verificación básica de identidad

---

### Gestión de Cuentas Bancarias

* Creación de cuentas
* Consulta de saldo en tiempo real
* Estado de cuenta detallado
* Bloqueo / desbloqueo de cuenta
* Asociación de múltiples cuentas a un cliente

---

### Gestión de Transacciones

* Transferencias internas entre cuentas
* Transferencias externas
* Depósitos
* Validación de fondos disponibles

---

### Conversión de Divisas

* Conversión entre múltiples monedas
* Consulta de tasas de cambio en tiempo real
* Cálculo automático de comisión

---

### Seguridad

* Tokens JWT con expiración
* Encriptación de datos sensibles
* Rate limiting en endpoints críticos
* Middleware de manejo global de excepciones

---

## Tecnologías Utilizadas

### Backend

* **Framework**: ASP.NET Core 8.0
* **Lenguaje**: C# (.NET 8)
* **Arquitectura**: Clean Architecture (4 capas)

### Base de Datos

* **ORM**: Entity Framework Core 9.0
* **Base de Datos**: PostgreSQL y MongoDB
* **Migraciones**: EF Core Migrations
* **Naming Convention**: Snake case

### Seguridad

* **JWT**: System.IdentityModel.Tokens.Jwt
* **Hashing**: Argon2 (Konscious.Security.Cryptography.Argon2)
* **Authentication**: Microsoft.AspNetCore.Authentication.JwtBearer
* **Headers**: NetEscapades.AspNetCore.SecurityHeaders

### Servicios Externos

* **Email**: MailKit (SMTP)
* **Almacenamiento**: Cloudinary(imágenes de perfil)

### Validación y Logging

* **Validación**: FluentValidation
* **Logging**: Serilog.AspNetCore

## Endpoints API

Base URL: `http://localhost:5062/api/v1`

---

## Login/Register (/log)

| Método | Ruta                        | Descripción                              | Auth |
|--------|----------------------------|------------------------------------------|------|
| POST   | /log/register             | Registrar nuevo usuario                  | No   |
| POST   | /log/login                | Iniciar sesión                           | No   |
| POST   | /log/verify-email         | Verificar correo electrónico             | No   |

---

## Salud (/health)

| Método | Ruta     | Descripción           | Auth |
|--------|----------|----------------------|------|
| GET    | /health  | Estado del servicio  | No   |

## Modelos de Request

### Registro (/log/register)

```json
{
  "Name": "Joshua",
  "Surname": "Solares",
  "username": "jsolares",
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "phone": "12345678"
}
```

### Login (/log/login)

```json
{
    "EmailOrUsername":"admin",
    "Password":"Informatica2026?"
}
```

### Verificación de Email (/log/verify-email)

```json
{
    "Token": "lPXyiDMkuR9-1Kxu0X4gnKjhxZS4VDHQ2zCSJflNlXw"
}
```
## 📁 Estructura del Proyecto

```
CrediExpress/
│
├── src/
│   │
│   ├── CrediExpress.Api/                 # Capa de presentación (API)
│   │   ├── Controllers/                  # Controladores HTTP
│   │   ├── Middlewares/                  # Middlewares personalizados
│   │   ├── Extensions/                   # Configuraciones y extensiones
│   │   ├── Filters/                      # Filtros globales
│   │   ├── Program.cs                    # Punto de entrada
│   │   └── appsettings.json              # Configuración general
│   │
│   ├── CrediExpress.Application/         # Lógica de negocio
│   │   ├── DTOs/                         # Objetos de transferencia de datos
│   │   ├── Interfaces/                   # Contratos de servicios
│   │   ├── Services/                     # Implementación de servicios
│   │   ├── Validators/                   # Validaciones (FluentValidation)
│   │   └── Mappings/                     # Configuración de AutoMapper
│   │
│   ├── CrediExpress.Domain/              # Entidades y reglas de dominio
│   │   ├── Entities/                     # Entidades principales
│   │   ├── Enums/                        # Enumeraciones
│   │   └── ValueObjects/                 # Objetos de valor
│   │
│   ├── CrediExpress.Infrastructure/      # Acceso a datos y servicios externos
│   │   ├── Persistence/                  # DbContext y configuraciones EF Core
│   │   ├── Repositories/                 # Implementación de repositorios
│   │   ├── Configurations/               # Configuraciones de base de datos
│   │   └── ExternalServices/             # Integraciones externas
│   │
│   └── CrediExpress.Tests/               # Pruebas unitarias
│
├── docker-compose.yml                    # Orquestación de contenedores
├── Dockerfile                            # Imagen del backend
├── .gitignore                            # Archivos ignorados por Git
├── CrediExpress.sln                      # Solución .NET
└── README.md                             # Documentación del proyecto
```
## Configuración

### Requisitos Previos

* MongoDB
* PostgreSQL 13 o superior
* Docker (opcional)
* Git
* Cuenta de Gmail

### Variables de Configuración

Crear `appsettings.Development.json` en `src/LogService.Api/`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=crediexpress;Username=IN6AM;Password=In6amKnl!;Port=5436"
  },
  "CloudinarySettings": {
    "CloudName": "dpxs0f5zw",
    "ApiKey": "521768524693749",
    "ApiSecret": "1Z2fmRasGsJ0-kVYEeXSX4s0Mdg",
    "BaseUrl": "https://res.cloudinary.com/dpxs0f5zw/image/upload/v1769786206/",
    "Folder": "auth_crediexpress/profiles",
    "DefaultAvatarPath": "avatarDefault-1749508519496.png"
  },
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": "465",
    "EnableSsl": "true",
    "Username": "official.hexacodee@gmail.com",
    "Password": "bogo pufu dyko lxke",
    "FromEmail": "official.hexacodee@gmail.com",
    "FromName": "CrediExpress Soporte",
    "Enabled": true,
    "Timeout": 10000,
    "UseFallback": false,
    "UseImplicitSsl": true,
    "IgnoreCertificateErrors": true
  },
  "JwtSettings": {
    "SecretKey": "E$3cr3tK3yF0rKln4lSp0rts@In6am2024",
    "Issuer": "CrediExpress",
    "Audience": "CrediExpress",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AppSettings": {
    "FrontendUrl": "http://localhost:3000"
  },
  "Security": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3000",
      "https://localhost:3001"
    ],
    "AdminAllowedOrigins": [
      "http://localhost:3000"
    ],
    "BlacklistedIPs": [],
    "WhitelistedIPs": [],
    "RestrictedPaths": []
  },
  "Serilog": {
    "Using": [
      "Serilog.Sinks.Console",
      "Serilog.Sinks.File"
    ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.Hosting.Lifetime": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log-service-.txt",
          "rollingInterval": "Day",
          "outputTemplate": "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}",
          "retainedFileCountLimit": 30
        }
      }
    ],
    "Enrich": [
      "FromLogContext"
    ]
  },
  "AllowedHosts": "*"
}
```

## Instalación y Ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone <url-repositorio>
cd auth-service
```

---

### 2️⃣ Restaurar dependencias

```bash
dotnet restore
```

---

### 3️⃣ Aplicar migraciones a la base de datos

```bash
cd src/AuthService.Api
dotnet ef database update
```

---

### 4️⃣ Ejecutar el servicio

```bash
dotnet run
```

El servicio estará disponible en: `http://localhost:5062/api/v1`

## Créditos

Este proyecto incluye partes de código de KinalSports, específicamente el servicio de autenticación (registro e inicio de sesión de usuarios),
creado por Braulio Echeverría.

Repositorio: https://github.com/IN6AMProm33/auth-service-dotnet.git

## Licencia

Licencia MIT


# English
# SistemaBancario

Secure full-stack banking system for account management, transaction processing, and currency exchange handling. Developed using React, Node.js, .NET, and Docker under the SCRUM agile framework, ensuring strong security, scalability, and high-performance operations.

## Main Features

### Authentication & Authorization

* Customer registration
* JWT-based login
* Optional Multi-Factor Authentication (MFA)
* Route protection with JWT Bearer Authentication
* Role-based system
* Role-Based Access Control (RBAC)
* Secure logout
* Account lockout after failed login attempts

---

### Customer Management

* Create and update customer profiles
* Get customer by ID
* User profiles with photo (Cloudinary)
* Account activation / deactivation
* Basic identity verification

---

### Bank Account Management

* Account creation
* Real-time balance inquiry
* Detailed account statement
* Account lock / unlock
* Multiple accounts per customer

---

### Transaction Management

* Internal transfers between accounts
* External transfers
* Deposits
* Available funds validation

---

### Currency Exchange

* Multi-currency conversion
* Real-time exchange rate consultation
* Automatic fee calculation

---

### Security

* JWT tokens with expiration
* Sensitive data encryption
* Rate limiting on critical endpoints
* Global exception handling middleware

---

## Technologies Used

### Backend

* **Framework**: ASP.NET Core 8.0
* **Language**: C# (.NET 8)
* **Architecture**: Clean Architecture (4 layers)

### Database

* **ORM**: Entity Framework Core 9.0
* **Database**: PostgreSQL and MongoDB
* **Migrations**: EF Core Migrations
* **Naming Convention**: Snake case

### Security

* **JWT**: System.IdentityModel.Tokens.Jwt
* **Hashing**: Argon2 (Konscious.Security.Cryptography.Argon2)
* **Authentication**: Microsoft.AspNetCore.Authentication.JwtBearer
* **Headers**: NetEscapades.AspNetCore.SecurityHeaders

### External Services

* **Email**: MailKit (SMTP)
* **Storage**: Cloudinary (profile images)

### Validation & Logging

* **Validation**: FluentValidation
* **Logging**: Serilog.AspNetCore

## API Endpoints

Base URL: `http://localhost:5062/api/v1`

---

## Login/Register (/log)

| Method | Route                | Description              | Auth |
|--------|----------------------|--------------------------|------|
| POST   | /log/register        | Register new user        | No   |
| POST   | /log/login           | Login                    | No   |
| POST   | /log/verify-email    | Verify email             | No   |

---

## Health (/health)

| Method | Route    | Description        | Auth |
|--------|----------|--------------------|------|
| GET    | /health  | Service status     | No   |

## Request Models

### Register (/log/register)

```json
{
  "Name": "Joshua",
  "Surname": "Solares",
  "username": "jsolares",
  "email": "usuario@ejemplo.com",
  "password": "Contraseña123!",
  "phone": "12345678"
}
```

### Login (/log/login)

```json
{
  "EmailOrUsername": "admin",
  "Password": "Informatica2026?"
}
```

### Email Verification (/log/verify-email)

```json
{
  "Token": "lPXyiDMkuR9-1Kxu0X4gnKjhxZS4VDHQ2zCSJflNlXw"
}
```

## 📁 Project Structure

```
CrediExpress/
│
├── src/
│   │
│   ├── CrediExpress.Api/                 # Presentation layer (API)
│   │   ├── Controllers/                  # HTTP controllers
│   │   ├── Middlewares/                  # Custom middlewares
│   │   ├── Extensions/                   # Configurations and extensions
│   │   ├── Filters/                      # Global filters
│   │   ├── Program.cs                    # Entry point
│   │   └── appsettings.json              # General configuration
│   │
│   ├── CrediExpress.Application/         # Business logic layer
│   │   ├── DTOs/                         # Data Transfer Objects
│   │   ├── Interfaces/                   # Service contracts
│   │   ├── Services/                     # Service implementations
│   │   ├── Validators/                   # FluentValidation validators
│   │   └── Mappings/                     # AutoMapper configurations
│   │
│   ├── CrediExpress.Domain/              # Domain entities and rules
│   │   ├── Entities/                     # Core entities
│   │   ├── Enums/                        # Enumerations
│   │   └── ValueObjects/                 # Value objects
│   │
│   ├── CrediExpress.Infrastructure/      # Data access and external services
│   │   ├── Persistence/                  # DbContext and EF Core configurations
│   │   ├── Repositories/                 # Repository implementations
│   │   ├── Configurations/               # Database configurations
│   │   └── ExternalServices/             # External integrations
│   │
│   └── CrediExpress.Tests/               # Unit tests
│
├── docker-compose.yml                    # Container orchestration
├── Dockerfile                            # Backend image
├── .gitignore                            # Git ignored files
├── CrediExpress.sln                      # .NET solution
└── README.md                             # Project documentation
```

## Configuration

### Prerequisites

* MongoDB
* PostgreSQL 13 or higher
* Docker (optional)
* Git
* Gmail account

### Configuration Variables

Create `appsettings.Development.json` inside `src/LogService.Api/`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=crediexpress;Username=IN6AM;Password=In6amKnl!;Port=5436"
  },
  "CloudinarySettings": {
    "CloudName": "dpxs0f5zw",
    "ApiKey": "521768524693749",
    "ApiSecret": "1Z2fmRasGsJ0-kVYEeXSX4s0Mdg",
    "BaseUrl": "https://res.cloudinary.com/dpxs0f5zw/image/upload/v1769786206/",
    "Folder": "auth_crediexpress/profiles",
    "DefaultAvatarPath": "avatarDefault-1749508519496.png"
  },
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": "465",
    "EnableSsl": "true",
    "Username": "official.hexacodee@gmail.com",
    "Password": "bogo pufu dyko lxke",
    "FromEmail": "official.hexacodee@gmail.com",
    "FromName": "CrediExpress Support",
    "Enabled": true,
    "Timeout": 10000,
    "UseFallback": false,
    "UseImplicitSsl": true,
    "IgnoreCertificateErrors": true
  },
  "JwtSettings": {
    "SecretKey": "E$3cr3tK3yF0rKln4lSp0rts@In6am2024",
    "Issuer": "CrediExpress",
    "Audience": "CrediExpress",
    "ExpirationMinutes": 60
  }
}
```

## Installation & Execution

### 1️⃣ Clone the repository

```bash
git clone <repository-url>
cd auth-service
```

---

### 2️⃣ Restore dependencies

```bash
dotnet restore
```

---

### 3️⃣ Apply database migrations

```bash
cd src/AuthService.Api
dotnet ef database update
```

---

### 4️⃣ Run the service

```bash
dotnet run
```

The service will be available at: `http://localhost:5062/api/v1`

## Credits

This project includes portions of code from KinalSports, specifically the authentication service (user registration and login),
created by Braulio Echeverría.

Repository: https://github.com/IN6AMProm33/auth-service-dotnet.git

## License

MIT License
