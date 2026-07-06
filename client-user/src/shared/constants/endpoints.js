// src/shared/constants/endpoints.js
//
// Cada base URL puede sobreescribirse con una variable EXPO_PUBLIC_* (ver .env.example).
// Los valores por defecto asumen "pnpm run dev" corriendo en la misma máquina.
// Si pruebas en un dispositivo físico (no emulador) por Wi-Fi, "localhost" NO sirve:
// define las variables EXPO_PUBLIC_*_URL con la IP LAN de tu computadora
// (ej. http://192.168.1.10:5062/api/v1/log).

export const ENDPOINTS = {
  // log-service (.NET) - login / logout / MFA
  LOG: process.env.EXPO_PUBLIC_LOG_URL || 'http://localhost:5062/api/v1/log',

  // auth-service (.NET) - registro, verificación de email, reset de password, usuarios
  AUTH: process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:5222/api/v1/auth',

  // account-service (Node) - perfiles de cuenta bancaria y alta de cliente
  ACCOUNT: process.env.EXPO_PUBLIC_ACCOUNT_URL || 'http://localhost:3004/crediExpress/v1',

  // bank-service (Node) - perfil bancario del cliente (cuentas vinculadas, riesgo)
  BANK: process.env.EXPO_PUBLIC_BANK_URL || 'http://localhost:3006/crediExpress/v1/bank',

  // accountType-service (Node) - catálogo de tipos de cuenta
  ACCOUNT_TYPE:
    process.env.EXPO_PUBLIC_ACCOUNT_TYPE_URL || 'http://localhost:3003/crediExpress/v1/account-types',

  // core-banking-service (Node) - depósitos, transferencias, favoritos, historial
  CORE_BANKING:
    process.env.EXPO_PUBLIC_CORE_BANKING_URL || 'http://localhost:3007/crediExpress/v1/core-banking',

  // product-currency-service (Node) - productos bancarios y catálogo de monedas
  PRODUCT_CURRENCY:
    process.env.EXPO_PUBLIC_PRODUCT_CURRENCY_URL || 'http://localhost:3008/crediExpress/v1',

  // currency-conversion-service (Node) - cotización y conversión de divisas
  CONVERSION:
    process.env.EXPO_PUBLIC_CONVERSION_URL || 'http://localhost:3009/crediExpress/v1/conversions',
};
