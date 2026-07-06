// src/shared/api/httpClient.js
//
// Fábrica de clientes axios compartida por authClient y logClient (y por los
// clientes de los demás microservicios que se agreguen en próximas fases).
//
// Injecta el Bearer token en cada petición y, ante un 401, intenta refrescar
// la sesión antes de forzar logout.
//
// NOTA IMPORTANTE: hoy ninguno de los dos servicios .NET de CrediExpress
// (auth-service / log-service) expone un endpoint de refresh token real.
// El JWT dura 60 minutos y no hay forma de renovarlo sin volver a hacer login.
// Este cliente deja la cola de refresco ya armada (mismo patrón que usa
// client-admin) para que, el día que el backend agregue POST /log/refresh,
// solo haya que activar la llamada real. Mientras tanto, cualquier intento de
// refresh fallará (no existe el endpoint) y el resultado práctico es: se hace
// logout limpio en vez de quedar reintentando en loop.

import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints';
import { getRefreshToken, useAuthStore } from '../store/authStore';

const NO_REFRESH_PATHS = [
  '/register',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/resend-verification',
];

function isExemptFromRefresh(url) {
  return NO_REFRESH_PATHS.some((path) => url?.includes(path));
}

export function createHttpClient(baseURL) {
  const client = axios.create({ baseURL, timeout: 15000 });

  let isRefreshing = false;
  let pendingQueue = [];

  function flushQueue(error, token) {
    pendingQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token);
    });
    pendingQueue = [];
  }

  client.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;

      if (!response || response.status !== 401 || !config || isExemptFromRefresh(config.url)) {
        return Promise.reject(error);
      }

      if (config._retriedAfterRefresh) {
        await useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          config._retriedAfterRefresh = true;
          config.headers.Authorization = `Bearer ${newToken}`;
          return client(config);
        });
      }

      config._retriedAfterRefresh = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error('No hay refresh token disponible');
        }

        const { data } = await axios.post(`${ENDPOINTS.LOG}/refresh`, { refreshToken });
        const newToken = data.accessToken || data.token;

        if (!newToken) {
          throw new Error('El backend no devolvió un token nuevo');
        }

        useAuthStore.getState().setAccessToken(newToken);
        flushQueue(null, newToken);

        config.headers.Authorization = `Bearer ${newToken}`;
        return client(config);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return client;
}
