import { axiosAccountType } from './api.js';

export const getAccountTypes = async () => {
  const { data } = await axiosAccountType.get('/account-types');
  return data;
};
