import { axiosBank } from './api.js';

const BANK_PATH = '/bank';

const getBankErrorMessage = (error, baseURL, path, fallbackMessage) => {
  const status = error.response?.status;
  const backendMessage = error.response?.data?.message;
  const backendError = error.response?.data?.error;

  if (status === 401) {
    if (backendError === 'MISSING_TOKEN') {
      return 'Bank-service rechazó la solicitud porque no recibió token de acceso.';
    }

    if (backendError === 'INVALID_TOKEN' || backendError === 'TOKEN_EXPIRED') {
      return 'Bank-service rechazó el token de acceso: inválido o vencido.';
    }

    if (backendMessage) {
      return backendMessage;
    }

    return `No tienes permisos para consumir ${baseURL}${path}.`;
  }

  if (status === 403) {
    return backendMessage || `No tienes permisos suficientes para acceder a ${baseURL}${path}.`;
  }

  if (status === 404) {
    return backendMessage || `No se encontró el endpoint ${baseURL}${path}.`;
  }

  return backendMessage || fallbackMessage;
};

export const getBankProfiles = async () => {
  const baseURL = import.meta.env.VITE_BANK_URL;

  if (!baseURL) {
    throw new Error('Falta configurar VITE_BANK_URL para cargar los perfiles bancarios.');
  }

  try {
    const { data } = await axiosBank.get(BANK_PATH);
    return data;
  } catch (error) {
    throw new Error(
      getBankErrorMessage(error, baseURL, BANK_PATH, 'No se pudieron cargar los perfiles bancarios.')
    );
  }
};

export const getBankProfileByUserId = async (userId) => {
  const baseURL = import.meta.env.VITE_BANK_URL;

  if (!baseURL) {
    throw new Error('Falta configurar VITE_BANK_URL para cargar el perfil bancario del usuario.');
  }

  try {
    const { data } = await axiosBank.get(
      `${BANK_PATH}/${userId}?_=${Date.now()}`
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    
    const err = new Error(
      getBankErrorMessage(
        error,
        baseURL,
        `${BANK_PATH}/${userId}`,
        'No se pudo cargar el perfil bancario del usuario.'
      )
    );
    err.status = error.response?.status;
    err.response = error.response;
    throw err;
  }
};

export const createBankProfile = async (payload) => {
  const baseURL = import.meta.env.VITE_BANK_URL;

  if (!baseURL) {
    throw new Error('Falta configurar VITE_BANK_URL para crear perfiles bancarios.');
  }

  try {
    const { data } = await axiosBank.post(BANK_PATH, payload);
    return data;
  } catch (error) {
    throw new Error(
      getBankErrorMessage(error, baseURL, BANK_PATH, 'No se pudo crear el perfil bancario.')
    );
  }
};

export const updateBankProfile = async (userId, payload) => {
  const baseURL = import.meta.env.VITE_BANK_URL;

  if (!baseURL) {
    throw new Error('Falta configurar VITE_BANK_URL para actualizar perfiles bancarios.');
  }

  try {
    const { data } = await axiosBank.put(`${BANK_PATH}/${userId}`, payload);
    return data;
  } catch (error) {
    throw new Error(
      getBankErrorMessage(
        error,
        baseURL,
        `${BANK_PATH}/${userId}`,
        'No se pudo actualizar el perfil bancario.'
      )
    );
  }
};
