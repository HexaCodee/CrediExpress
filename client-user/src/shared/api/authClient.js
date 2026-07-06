// src/shared/api/authClient.js
//
// Cliente para auth-service (.NET, puerto 5222): registro de clientes,
// verificación de email, recuperación de contraseña y gestión de perfil.

import { ENDPOINTS } from '../constants/endpoints';
import { createHttpClient } from './httpClient';

const authClient = createHttpClient(ENDPOINTS.AUTH);

export default authClient;

export function register(formData) {
  // No fijar Content-Type a mano: axios/React Native generan el boundary
  // correcto al detectar que el body es un FormData. Forzarlo aquí rompe el
  // multipart cuando incluye un archivo binario (ver updateProfile).
  return authClient.post('/register', formData);
}

export function verifyEmail(token) {
  return authClient.get('/verify-email', { params: { token } });
}

export function resendVerification(email) {
  return authClient.post('/resend-verification', { email });
}

export function forgotPassword(email) {
  return authClient.post('/forgot-password', { email });
}

export function resetPassword(payload) {
  return authClient.post('/reset-password', payload);
}

export function updateProfile(userId, formData) {
  // Mismo motivo que en register(): dejar que axios/React Native pongan el
  // Content-Type con el boundary correcto en vez de fijarlo nosotros.
  return authClient.put(`/users/${userId}`, formData);
}

// auth-service no expone GET /users/:id (perfil propio); solo GET /users
// (lista TODOS los usuarios, sin filtrar por rol). Se usa aquí para
// encontrar el propio perfil por id en el cliente, ya que hoy no hay una
// alternativa más liviana en el backend.
export function getUsers() {
  return authClient.get('/users');
}
