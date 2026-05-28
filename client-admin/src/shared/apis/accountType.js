import { axiosAccountType } from './api.js';

const ACCOUNT_TYPES_PATH = '/account-types';

export const getAccountTypes = async () => {
  const baseURL = import.meta.env.VITE_ACCOUNT_TYPE_URL;

  if (!baseURL) {
    throw new Error('No se puede cargar los tipos de cuenta.');
  }

  try {
    const { data } = await axiosAccountType.get(ACCOUNT_TYPES_PATH);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`No se encontró el endpoint de account-type en ${baseURL}${ACCOUNT_TYPES_PATH}.`);
    }

    throw error;
  }
};
