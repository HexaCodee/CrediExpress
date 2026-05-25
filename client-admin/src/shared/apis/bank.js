import { axiosBank } from './api.js';

export const getBankProfiles = async () => {
  const { data } = await axiosBank.get('/bank');
  return data;
};

export const getBankProfileByUserId = async (userId) => {
  const { data } = await axiosBank.get(`/bank/${userId}`);
  return data;
};

export const createBankProfile = async (payload) => {
  const { data } = await axiosBank.post('/bank', payload);
  return data;
};

export const updateBankProfile = async (userId, payload) => {
  const { data } = await axiosBank.put(`/bank/${userId}`, payload);
  return data;
};
