const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

// Esta PC tiene varias tarjetas de red a la vez (Ethernet real + adaptadores
// virtuales de Docker/WSL + WiFi desconectado). Expo intenta adivinar cuál IP
// anunciar en el QR para que el teléfono se conecte, y a veces adivina mal
// (ha llegado a anunciar 127.0.0.1, que en el teléfono significa "yo mismo",
// no la PC). Forzamos explícitamente la IP LAN correcta.
// IMPORTANTE: si cambias de red WiFi/Ethernet, esta IP puede cambiar - revisa
// con "ipconfig" y actualiza este valor (debe coincidir con las URLs de .env).
if (!process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
  process.env.REACT_NATIVE_PACKAGER_HOSTNAME = '192.168.5.123';
}

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// CrediExpress es un monorepo pnpm con varios microservicios Node/.NET en
// carpetas hermanas. getDefaultConfig detecta el pnpm-workspace.yaml de la
// raíz y por defecto amplía watchFolders a TODO el monorepo (src/ de cada
// microservicio, node_modules de cada uno, bin/obj de los .NET), lo que en
// Windows hace que Metro intente vigilar cientos de miles de archivos y
// falle con "Failed to start watch mode".
//
// pnpm resuelve las dependencias de client-user con symlinks que apuntan al
// store compartido en <raíz>/node_modules/.pnpm, así que Metro SÍ necesita
// poder ver esa carpeta (si solo vigilamos client-user, cualquier paquete
// symlinkeado deja de resolverse: "Unable to resolve module ..."). La
// vigilamos solo a ella y a esta carpeta, no a los demás microservicios.
config.watchFolders = [projectRoot, path.join(workspaceRoot, 'node_modules')];

config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
];

module.exports = config;
