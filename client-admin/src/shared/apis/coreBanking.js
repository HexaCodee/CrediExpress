import { axiosCoreBanking } from './api.js';

export const registerOperationalAccount = async (payload) => {
  const { data } = await axiosCoreBanking.post('/core-banking/accounts/register', payload);
  return data;
};

export const createDeposit = async (payload) => {
  const { data } = await axiosCoreBanking.post('/core-banking/deposits', payload);
  return data;
};

export const getAccountHistory = async (accountNumber, limit) => {
  const { data } = await axiosCoreBanking.get(`/core-banking/history/account/${accountNumber}${limit ? `?limit=${limit}` : ''}`);
  return data;
};

export const getRecentMovements = async (accountNumber, limit) => {
  const { data } = await axiosCoreBanking.get(`/core-banking/history/account/${accountNumber}/recent${limit ? `?limit=${limit}` : ''}`);
  return data;
};

export const getOperationalAccount = async (accountNumber, config = {}) => {
  try {
    const { data } = await axiosCoreBanking.get(
      `/core-banking/accounts/${accountNumber}`,
      config
    );
    return data;
  } catch (err) {
    // If the account was deleted or doesn't exist the backend may return 404.
    // Return a safe default so callers can continue aggregations without throwing.
    if (err?.response?.status === 404) {
      return { account: null };
    }
    throw err;
  }
};

export const getAccountOverview = async (accountNumber) => {
  const { data } = await axiosCoreBanking.get(`/admin/accounts/${accountNumber}/overview`);
  return data;
};

export const createTransfer = async (payload) => {
  const { data } = await axiosCoreBanking.post('/core-banking/transfers', payload);
  return data;
};
