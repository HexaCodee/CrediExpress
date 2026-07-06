$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Get-LanIPAddress {
    $excludedAliasPattern = "vEthernet|Loopback|WSL|Docker|VirtualBox|VMware|Hyper-V"

    $candidates = Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -notlike "169.254.*" -and
            $_.IPAddress -ne "127.0.0.1" -and
            $_.InterfaceAlias -notmatch $excludedAliasPattern
        }

    if (-not $candidates) {
        return $null
    }

    # Preferir la tarjeta que Windows reconoce como una red activa de verdad
    # (evita elegir una tarjeta desconectada o solo-local).
    $activeAliases = Get-NetConnectionProfile | Select-Object -ExpandProperty InterfaceAlias
    $preferred = $candidates | Where-Object { $_.InterfaceAlias -in $activeAliases } | Select-Object -First 1

    if ($preferred) {
        return $preferred.IPAddress
    }

    return ($candidates | Select-Object -First 1).IPAddress
}

$lanIp = Get-LanIPAddress

if (-not $lanIp) {
    Write-Host "No se pudo detectar una IP de red válida. Revisa tu conexión." -ForegroundColor Red
    exit 1
}

Write-Host "IP de red detectada: $lanIp" -ForegroundColor Cyan

$envPath = Join-Path $root "client-user/.env"
$metroConfigPath = Join-Path $root "client-user/metro.config.cjs"
$ipPattern = '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'

if (Test-Path $envPath) {
    $envContent = Get-Content -Raw $envPath
    $updatedEnv = $envContent -replace "http://$ipPattern`:", "http://$lanIp`:"

    if ($updatedEnv -ne $envContent) {
        Set-Content -Path $envPath -Value $updatedEnv -NoNewline
        Write-Host "client-user/.env actualizado con $lanIp" -ForegroundColor Green
    } else {
        Write-Host "client-user/.env ya estaba con $lanIp" -ForegroundColor Green
    }
} else {
    Write-Host "No existe client-user/.env, créalo desde .env.example primero." -ForegroundColor Yellow
}

if (Test-Path $metroConfigPath) {
    $metroContent = Get-Content -Raw $metroConfigPath
    $updatedMetro = $metroContent -replace "REACT_NATIVE_PACKAGER_HOSTNAME = '$ipPattern'", "REACT_NATIVE_PACKAGER_HOSTNAME = '$lanIp'"

    if ($updatedMetro -ne $metroContent) {
        Set-Content -Path $metroConfigPath -Value $updatedMetro -NoNewline
        Write-Host "client-user/metro.config.cjs actualizado con $lanIp" -ForegroundColor Green
    } else {
        Write-Host "client-user/metro.config.cjs ya estaba con $lanIp" -ForegroundColor Green
    }
}

$currentProfile = Get-NetConnectionProfile | Where-Object { $_.IPv4Connectivity -eq "Internet" } | Select-Object -First 1
if ($currentProfile -and $currentProfile.NetworkCategory -ne "Private") {
    Write-Host ""
    Write-Host "AVISO: tu red '$($currentProfile.InterfaceAlias)' está marcada como '$($currentProfile.NetworkCategory)', no 'Private'." -ForegroundColor Yellow
    Write-Host "Los servicios .NET (auth-service, log-service) solo aceptan conexiones en redes Private." -ForegroundColor Yellow
    Write-Host "Cambialo en Configuración > Red e Internet > (tu red) > marca como Privada." -ForegroundColor Yellow
}
