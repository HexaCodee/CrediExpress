$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Deteniendo procesos previos..." -ForegroundColor Yellow
node "$root/scripts/stop.mjs"

Write-Host "Detectando IP de red para client-user..." -ForegroundColor Yellow
& "$root/scripts/update-lan-ip.ps1"

Write-Host "Levantando PostgreSQL y MongoDB..." -ForegroundColor Yellow
docker compose -f "$root/pg/docker-compose.yml" up -d

function Wait-ContainerHealthy {
    param(
        [string]$ContainerName,
        [int]$TimeoutSeconds = 120
    )

    Write-Host "Esperando a que $ContainerName esté healthy..." -ForegroundColor Yellow
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        $status = docker inspect -f '{{.State.Health.Status}}' $ContainerName 2>$null
        if ($status -eq "healthy") {
            Write-Host "$ContainerName está healthy." -ForegroundColor Green
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "Timeout esperando a que $ContainerName esté healthy"
}

Wait-ContainerHealthy -ContainerName "crediexpress_postgres"
Wait-ContainerHealthy -ContainerName "crediexpress_mongodb"

$services = @(
    @{ Name = "role-node";                   Path = "role-node";                                                Cmd = "pnpm run dev" },
    @{ Name = "accountType-service";         Path = "accountType-service";                                      Cmd = "pnpm run dev" },
    @{ Name = "account-service";             Path = "account-service";                                          Cmd = "pnpm run dev" },
    @{ Name = "bank-service";                Path = "bank-service";                                             Cmd = "pnpm run dev" },
    @{ Name = "core-banking-service";        Path = "core-banking-service";                                     Cmd = "pnpm run dev" },
    @{ Name = "product-currency-service";    Path = "product-currency-service";                                 Cmd = "pnpm run dev" },
    @{ Name = "currency-conversion-service"; Path = "currency-conversion-service";                               Cmd = "pnpm run dev" },
    @{ Name = "client-admin";                Path = "client-admin";                                             Cmd = "pnpm run dev" },
    @{ Name = "auth-service";                Path = "authentication-service/auth-service/src/AuthService.Api";  Cmd = "dotnet run --launch-profile http" },
    @{ Name = "log-service";                 Path = "login-service/log-service/src/LogService.Api";             Cmd = "dotnet run --launch-profile http" },
    @{ Name = "client-user";                 Path = "client-user";                                              Cmd = "Write-Host 'Precalentando Metro en segundo plano (puede tardar varios minutos la primera vez, es normal)...' -ForegroundColor Yellow; Start-Job -ScriptBlock { param(`$u) do { Start-Sleep -Seconds 3 } until (Test-NetConnection -ComputerName localhost -Port 8081 -WarningAction SilentlyContinue -InformationLevel Quiet); try { Invoke-WebRequest -Uri `$u -UseBasicParsing -TimeoutSec 400 | Out-Null } catch {}; Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Ya puedes escanear el QR de client-user con Expo Go.', 'CrediExpress - Listo', 'OK', 'Information') } -ArgumentList 'http://localhost:8081/client-user/index.bundle?platform=android&dev=true&hot=false' | Out-Null; pnpm run start" }
)

foreach ($svc in $services) {
    $fullPath = Join-Path $root $svc.Path
    $title = $svc.Name
    $command = $svc.Cmd

    Write-Host "Abriendo terminal para $title..." -ForegroundColor Cyan

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "`$host.UI.RawUI.WindowTitle = '$title'; Set-Location -LiteralPath '$fullPath'; $command"
    )

    if ($command -like "*dotnet run*") {
        # Los proyectos .NET restauran/compilan contra el mismo caché de NuGet.
        # Si dos "dotnet run" arrancan casi al mismo tiempo, pueden pelearse por
        # archivos de bloqueo de MSBuild y una de las dos ventanas se queda en
        # blanco sin arrancar. Les damos más espacio entre sí.
        Start-Sleep -Seconds 8
    } else {
        Start-Sleep -Milliseconds 400
    }
}

Write-Host ""
Write-Host "Listo. Se abrieron $($services.Count) terminales, una por servicio." -ForegroundColor Green
Write-Host "Para detener todo: pnpm run stop" -ForegroundColor Green
