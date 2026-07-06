// src/features/auth/hooks/useAuth.js
import { useState } from 'react';
import { login as loginRequest, logout as logoutRequest } from '../../../shared/api/logClient';
import { useAuthStore } from '../../../shared/store/authStore';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);

  async function handleLogin(emailOrUsername, password) {
    setLoading(true);
    setError(null);

    try {
      const { data } = await loginRequest(emailOrUsername, password);

      if (data.requiresMfa) {
        throw new Error('Esta cuenta requiere un código de verificación (MFA). Revisa tu correo.');
      }

      // El backend a veces devuelve "token" (log-service real) y a veces
      // "accessToken"/"user" en otras variantes históricas; toleramos ambas.
      const accessToken = data.token || data.accessToken;
      const user = data.userDetails || data.user;
      const refreshToken = data.refreshToken;

      if (!accessToken) {
        throw new Error('El servidor no devolvió un token de acceso');
      }

      await storeLogin(accessToken, user, refreshToken);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'No se pudo iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // Best-effort: aunque el backend falle (token vencido, red caída),
      // igual limpiamos la sesión local.
    } finally {
      await storeLogout();
    }
  }

  return { handleLogin, loading, error, logout };
}
