# CrediExpress Stack

Orquestador Docker para la plataforma CrediExpress. A diferencia de un stack multi-repo,
este orquestador vive **dentro del monorepo** de CrediExpress (pnpm workspace): todos los
microservicios ya estan presentes como carpetas hermanas de `crediexpress-stack/` en la
raiz del repositorio, asi que no hace falta clonar ni enlazar nada — el `docker-compose.yml`
apunta directamente a `../<servicio>`.

## Inicio rapido

```bash
cd crediexpress-stack
cp .env.docker.example .env.docker
# Edita .env.docker con tus secretos (JWT, Cloudinary, SMTP, ExchangeRate API, etc.)

docker compose --env-file .env.docker up --build
```

## Arquitectura

```
              +------------------+       +--------------------+
              |   client-admin   |       |    client-user      |
              | React + Vite     |       | React Native Expo   |
              | :5173            |       | :8081                |
              +--------+---------+       +----------+----------+
                       |                            |
   role-node/accountType/account/bank/           auth-service, log-service,
   core-banking/currency-conversion/              account-service, ...
   product-currency (:3002-:3009)                 (:5222, :5062, ...)
                       |                            |
                       v                            v
              +--------+---------+       +----------+----------+
              |    MongoDB       |       |     PostgreSQL       |
              | (roles/cuentas/  |       | (usuarios/auth/logs) |
              |  bancos/etc.)    |       |                      |
              +------------------+       +----------------------+
```

CrediExpress usa **dos motores de autenticacion .NET** (no uno Node + uno .NET como en
otros stacks similares):

| Servicio                    | Tecnologia   | Puerto | Base de datos |
| ---------------------------- | ------------ | ------ | -------------- |
| auth-service                 | .NET 8       | 5222   | PostgreSQL     |
| log-service                  | .NET 8       | 5062   | PostgreSQL     |
| role-node                    | Node/Express | 3002   | MongoDB        |
| accountType-service           | Node/Express | 3003   | MongoDB        |
| account-service               | Node/Express | 3004   | MongoDB        |
| bank-service                  | Node/Express | 3006   | MongoDB        |
| core-banking-service          | Node/Express | 3007   | MongoDB        |
| product-currency-service      | Node/Express | 3008   | MongoDB        |
| currency-conversion-service   | Node/Express | 3009   | MongoDB        |
| client-admin                  | React + Vite | 5173   | -              |
| client-user                   | Expo (RN)    | 8081   | -              |

## Estructura del workspace

```
CrediExpress/                        # raiz del monorepo (pnpm workspace)
├── crediexpress-stack/              # <- este orquestador
│   ├── docker-compose.yml
│   ├── dockerfiles/
│   ├── .env.docker.example
│   └── README.md
├── client-admin/
├── client-user/
├── role-node/
├── accountType-service/
├── account-service/
├── bank-service/
├── core-banking-service/
├── currency-conversion-service/
├── product-currency-service/
├── authentication-service/
│   └── auth-service/
├── login-service/
│   └── log-service/
└── pg/                              # docker-compose standalone de Postgres/Mongo (dev sin Docker completo)
```

Cada Dockerfile en `dockerfiles/` usa como contexto de build la carpeta del servicio
correspondiente (`../<servicio>`), **excepto `client-user`**: como no tiene su propio
`pnpm-lock.yaml` (usa el lockfile raiz del workspace), su build usa como contexto la raiz
del monorepo completo (`..`) para poder resolver el workspace de pnpm correctamente.

## Puertos Docker

| Servicio                    | Puerto host        | URL base                                          |
| ----------------------------- | ------------------ | -------------------------------------------------- |
| postgres                      | 5436                | `localhost:5436`                                   |
| mongodb                       | 27017               | `localhost:27017`                                  |
| auth-service                  | 5222                | `http://localhost:5222/api/v1`                     |
| log-service                   | 5062                | `http://localhost:5062/api/v1`                     |
| role-node                     | 3002                | `http://localhost:3002/crediExpress/v1`            |
| accountType-service            | 3003                | `http://localhost:3003/crediExpress/v1`            |
| account-service                | 3004                | `http://localhost:3004/crediExpress/v1`            |
| bank-service                   | 3006                | `http://localhost:3006/crediExpress/v1`            |
| core-banking-service           | 3007                | `http://localhost:3007/crediExpress/v1`            |
| product-currency-service       | 3008                | `http://localhost:3008/crediExpress/v1`            |
| currency-conversion-service    | 3009                | `http://localhost:3009/crediExpress/v1`            |
| client-admin                   | 5173                | `http://localhost:5173`                            |
| client-user                    | 8081, 19000-19002   | Metro bundler                                       |

Health checks:

```bash
curl http://localhost:5222/api/v1/health
curl http://localhost:5062/api/v1/health
curl http://localhost:3002/crediExpress/v1/health
curl http://localhost:3003/crediExpress/v1/health
curl http://localhost:3004/crediExpress/v1/health
curl http://localhost:3006/crediExpress/v1/health
curl http://localhost:3007/crediExpress/v1/health
curl http://localhost:3008/crediExpress/v1/health
curl http://localhost:3009/crediExpress/v1/health
```

## Variables de entorno

- **Stack Docker:** copia `.env.docker.example` a `.env.docker` en esta carpeta y usa
  `docker compose --env-file .env.docker`.
- **Cada microservicio:** tiene su propio `.env` (Node) o `appsettings.json` (.NET,
  ignorado por git) para desarrollo **sin Docker**.

`JWT_SECRET`, `JWT_ISSUER` y `JWT_AUDIENCE` deben coincidir entre **todos** los servicios
(Node y .NET), ya que auth-service/log-service emiten los tokens que los microservicios
Node validan.

## Detener y limpiar

```bash
docker compose down -v --rmi local --remove-orphans
```

Borra contenedores, volumenes (Postgres/Mongo) e imagenes locales del proyecto
`crediexpress-stack`.

## Desarrollo local (sin Docker)

Desde la raiz del monorepo (no dentro de `crediexpress-stack/`):

```bash
pnpm install                 # instala TODO el workspace (una sola vez, desde la raiz)
pnpm dev                     # levanta Postgres/Mongo (docker), todos los servicios Node
                              # y los dos servicios .NET (ver scripts/dev.mjs)
```

**Puertos al conectar desde el host** (con el stack Docker levantado via
`crediexpress-stack/docker-compose.yml`):

| Servicio   | Puerto host |
| ---------- | ----------- |
| PostgreSQL | 5436        |
| MongoDB    | 27017       |

## Diferencias con un stack multi-repo tipico

Este orquestador esta adaptado de un stack multi-repo (donde cada microservicio es un
repositorio git independiente clonado o enlazado dentro del orquestador). CrediExpress es
un **monorepo pnpm workspace**, asi que aqui:

- No existen `repos.yaml` ni scripts de bootstrap/clonado: los servicios ya viven en el
  repo, como carpetas hermanas de `crediexpress-stack/`.
- Los `Dockerfile.*` de servicios Node usan el lockfile propio de cada servicio (cada uno
  mantiene su `pnpm-lock.yaml`), excepto `client-user`, que usa el lockfile raiz del
  workspace.
- Hay dos servicios de autenticacion en .NET (`auth-service`, `log-service`) en vez de uno
  Node + uno .NET.

## Autor y licencia

Ver [LICENSE](LICENSE).
