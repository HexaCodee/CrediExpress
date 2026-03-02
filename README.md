# Español
# SistemaBancario

Sistema bancario con arquitectura de microservicios para gestión de usuarios, roles, cuentas, productos, divisas y operaciones bancarias. El repositorio integra servicios en Node.js y .NET, con PostgreSQL y MongoDB como motores de datos.

## Funcionalidades Principales

### Autenticación y Autorización

* Registro y autenticación de usuarios (servicios .NET)
* JWT para autorización entre servicios
* Gestión de roles y permisos
* Middleware de validación de token y control de acceso

---

### Gestión de Clientes y Cuentas

* Gestión de perfiles de cuenta bancaria
* Administración de tipos de cuenta
* Apertura, bloqueo, desbloqueo y cierre de cuentas
* Consultas de cuentas por usuario y por número

---

### Gestión Bancaria Operativa

* Depósitos y transferencias
* Historial de movimientos y consultas recientes
* Gestión de cuentas favoritas
* Reportes operativos para administración

---

### Productos y Divisas

* Gestión de productos bancarios
* Gestión de monedas
* Cotización y conversión de divisas
* Actualización de tasas de cambio

---

### Seguridad y Observabilidad

* Rate limiting y headers de seguridad
* Manejo global de errores
* Logging en servicios Node.js y .NET
* Endpoints de health check por servicio

---

## Tecnologías Utilizadas

### Backend

* **Node.js** + **Express** (microservicios de dominio)
* **ASP.NET Core 8** (servicios de autenticación y login)
* **JavaScript (ES Modules)** y **C# (.NET 8)**

### Base de Datos

* **MongoDB** (servicios Node.js)
* **PostgreSQL** (servicios .NET)
* **Mongoose** y **Entity Framework Core**

### Seguridad

* **JWT** para autenticación/autorización
* **Helmet**, **CORS**, **express-rate-limit**
* **Security Headers** y configuración de autenticación en .NET

### Infraestructura y Herramientas

* **Docker Compose** para PostgreSQL y MongoDB
* **pnpm** para servicios Node.js
* **dotnet CLI** para servicios .NET
* **Postman collection** incluida

## Endpoints API

Prefijos principales:

* Node.js: `http://localhost:<puerto>/crediExpress/v1`
* .NET: `http://localhost:5222/api/v1` (AuthService) y `http://localhost:5062/api/v1` (LogService)

---

## Servicios del Proyecto

| Servicio | Stack | Puerto local | Base path principal | Health |
|--------|-------|------------|---------------------|--------|
| accountType-service | Node.js | 3003 | `/crediExpress/v1/account-types` | `/crediExpress/v1/health` |
| account-service | Node.js | 3004 | `/crediExpress/v1/accounts` | `/crediExpress/v1/health` |
| bank-service | Node.js | 3006 | `/crediExpress/v1/bank` | `/crediExpress/v1/health` |
| core-banking-service | Node.js | 3007 | `/crediExpress/v1/core-banking` | `/crediExpress/v1/health` |
| product-currency-service | Node.js | 3008 | `/crediExpress/v1/products` y `/crediExpress/v1/currencies` | `/crediExpress/v1/health` |
| currency-conversion-service | Node.js | 3009 | `/crediExpress/v1/conversions` | `/crediExpress/v1/health` |
| role-node | Node.js | 3002 | `/crediExpress/v1/roles` | `/crediExpress/v1/health` |
| authentication-service/auth-service | .NET | 5222 | `/api/v1` | `/api/v1/health` |
| login-service/log-service | .NET | 5062 | `/api/v1` | `/api/v1/health` |

> Nota: los servicios Node.js usan MongoDB y los servicios .NET usan PostgreSQL.

## 📁 Estructura del Proyecto

```text
CrediExpress/
│
├── account-service/
├── accountType-service/
├── authentication-service/
│   └── auth-service/
├── bank-service/
├── core-banking-service/
├── currency-conversion-service/
├── login-service/
│   └── log-service/
├── product-currency-service/
├── role-node/
├── pg/
│   └── docker-compose.yml
├── postman/
│   └── CrediExpress.postman_collection.json
├── LICENSE
└── README.md
```

## Configuración

### Requisitos Previos

* Node.js 20+
* pnpm 10+
* .NET SDK 8+
* Docker y Docker Compose
* Git

### Variables de Configuración

Cada servicio Node.js utiliza su propio archivo `.env` con valores como:

```env
PORT=3002
URI_MONGODB=mongodb://<usuario>:<password>@localhost:27017/<database>?authSource=admin
JWT_ISSUER=<issuer>
JWT_AUDIENCE=<audience>
JWT_SECRET=<secret>
JWT_EXPIRES_IN=1h
```

Los servicios .NET usan `appsettings.json` / `appsettings.Development.json` con una cadena de conexión PostgreSQL como:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5436;Database=crediexpress;Username=<user>;Password=<password>"
  }
}
```

## Instalación y Ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone <url-repositorio>
cd CrediExpress
```

---

### 2️⃣ Levantar bases de datos (PostgreSQL + MongoDB)

```bash
cd pg
docker compose up -d
```

---

### 3️⃣ Ejecutar servicios Node.js

Ejemplo (`role-node`):

```bash
cd role-node
pnpm install
pnpm run dev
```

Repetir en cada carpeta Node.js:

* `account-service`
* `accountType-service`
* `bank-service`
* `core-banking-service`
* `product-currency-service`
* `currency-conversion-service`
* `role-node`

---

### 4️⃣ Ejecutar servicios .NET

AuthService:

```bash
cd authentication-service/auth-service/src/AuthService.Api
dotnet restore
dotnet run
```

LogService:

```bash
cd login-service/log-service/src/LogService.Api
dotnet restore
dotnet run
```

---

### 5️⃣ Validar health checks

* `http://localhost:3002/crediExpress/v1/health`
* `http://localhost:3003/crediExpress/v1/health`
* `http://localhost:3004/crediExpress/v1/health`
* `http://localhost:3006/crediExpress/v1/health`
* `http://localhost:3007/crediExpress/v1/health`
* `http://localhost:3008/crediExpress/v1/health`
* `http://localhost:3009/crediExpress/v1/health`
* `http://localhost:5222/api/v1/health`
* `http://localhost:5062/api/v1/health`

## Créditos

Este proyecto incluye partes de código de KinalSports, específicamente el servicio de autenticación (registro e inicio de sesión de usuarios),
creado por Braulio Echeverría.

Repositorio: https://github.com/IN6AMProm33/auth-service-dotnet.git

## Licencia

Licencia MIT


# English
# SistemaBancario

Banking system based on a microservices architecture for user management, roles, accounts, products, currencies, and core banking operations. This repository combines Node.js and .NET services, using PostgreSQL and MongoDB as data stores.

## Main Features

### Authentication & Authorization

* User registration and authentication (.NET services)
* JWT-based authorization across services
* Role and permission management
* Token validation and access-control middleware

---

### Customer and Account Management

* Bank profile/account management
* Account type administration
* Open, block, unblock, and close accounts
* Account queries by user and account number

---

### Core Banking Operations

* Deposits and transfers
* Transaction history and recent activity
* Favorite accounts management
* Operational admin queries

---

### Products and Currencies

* Banking product management
* Currency catalog management
* FX quote and conversion
* Exchange rate refresh operations

---

### Security and Observability

* Rate limiting and security headers
* Global error handling
* Logging on Node.js and .NET services
* Health check endpoints per service

---

## Technologies Used

### Backend

* **Node.js** + **Express** (domain microservices)
* **ASP.NET Core 8** (auth and login services)
* **JavaScript (ES Modules)** and **C# (.NET 8)**

### Database

* **MongoDB** (Node.js services)
* **PostgreSQL** (.NET services)
* **Mongoose** and **Entity Framework Core**

### Security

* **JWT** for authentication/authorization
* **Helmet**, **CORS**, **express-rate-limit**
* **Security headers** and .NET auth configuration

### Infrastructure & Tooling

* **Docker Compose** for PostgreSQL and MongoDB
* **pnpm** for Node.js services
* **dotnet CLI** for .NET services
* Included **Postman collection**

## API Endpoints

Main prefixes:

* Node.js: `http://localhost:<port>/crediExpress/v1`
* .NET: `http://localhost:5222/api/v1` (AuthService) and `http://localhost:5062/api/v1` (LogService)

---

## Project Services

| Service | Stack | Local port | Main base path | Health |
|--------|-------|----------|----------------|--------|
| accountType-service | Node.js | 3003 | `/crediExpress/v1/account-types` | `/crediExpress/v1/health` |
| account-service | Node.js | 3004 | `/crediExpress/v1/accounts` | `/crediExpress/v1/health` |
| bank-service | Node.js | 3006 | `/crediExpress/v1/bank` | `/crediExpress/v1/health` |
| core-banking-service | Node.js | 3007 | `/crediExpress/v1/core-banking` | `/crediExpress/v1/health` |
| product-currency-service | Node.js | 3008 | `/crediExpress/v1/products` and `/crediExpress/v1/currencies` | `/crediExpress/v1/health` |
| currency-conversion-service | Node.js | 3009 | `/crediExpress/v1/conversions` | `/crediExpress/v1/health` |
| role-node | Node.js | 3002 | `/crediExpress/v1/roles` | `/crediExpress/v1/health` |
| authentication-service/auth-service | .NET | 5222 | `/api/v1` | `/api/v1/health` |
| login-service/log-service | .NET | 5062 | `/api/v1` | `/api/v1/health` |

> Note: Node.js services use MongoDB and .NET services use PostgreSQL.

## 📁 Project Structure

```text
CrediExpress/
│
├── account-service/
├── accountType-service/
├── authentication-service/
│   └── auth-service/
├── bank-service/
├── core-banking-service/
├── currency-conversion-service/
├── login-service/
│   └── log-service/
├── product-currency-service/
├── role-node/
├── pg/
│   └── docker-compose.yml
├── postman/
│   └── CrediExpress.postman_collection.json
├── LICENSE
└── README.md
```

## Configuration

### Prerequisites

* Node.js 20+
* pnpm 10+
* .NET SDK 8+
* Docker and Docker Compose
* Git

### Configuration Variables

Each Node.js service uses its own `.env` file with values such as:

```env
PORT=3002
URI_MONGODB=mongodb://<user>:<password>@localhost:27017/<database>?authSource=admin
JWT_ISSUER=<issuer>
JWT_AUDIENCE=<audience>
JWT_SECRET=<secret>
JWT_EXPIRES_IN=1h
```

.NET services use `appsettings.json` / `appsettings.Development.json` with a PostgreSQL connection string like:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5436;Database=crediexpress;Username=<user>;Password=<password>"
  }
}
```

## Installation & Execution

### 1️⃣ Clone the repository

```bash
git clone <repository-url>
cd CrediExpress
```

---

### 2️⃣ Start databases (PostgreSQL + MongoDB)

```bash
cd pg
docker compose up -d
```

---

### 3️⃣ Run Node.js services

Example (`role-node`):

```bash
cd role-node
pnpm install
pnpm run dev
```

Repeat in each Node.js folder:

* `account-service`
* `accountType-service`
* `bank-service`
* `core-banking-service`
* `product-currency-service`
* `currency-conversion-service`
* `role-node`

---

### 4️⃣ Run .NET services

AuthService:

```bash
cd authentication-service/auth-service/src/AuthService.Api
dotnet restore
dotnet run
```

LogService:

```bash
cd login-service/log-service/src/LogService.Api
dotnet restore
dotnet run
```

---

### 5️⃣ Validate health checks

* `http://localhost:3002/crediExpress/v1/health`
* `http://localhost:3003/crediExpress/v1/health`
* `http://localhost:3004/crediExpress/v1/health`
* `http://localhost:3006/crediExpress/v1/health`
* `http://localhost:3007/crediExpress/v1/health`
* `http://localhost:3008/crediExpress/v1/health`
* `http://localhost:3009/crediExpress/v1/health`
* `http://localhost:5222/api/v1/health`
* `http://localhost:5062/api/v1/health`

## Credits

This project includes portions of code from KinalSports, specifically the authentication service (user registration and login),
created by Braulio Echeverría.

Repository: https://github.com/IN6AMProm33/auth-service-dotnet.git

## License

MIT License
