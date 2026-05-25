import { axiosAdmin } from './api.js';

export const updateUser = async (userId, formData) => {
  const { data } = await axiosAdmin.put(`/auth/users/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getAllUsers = async () => {
  const { data } = await axiosAdmin.get('/auth/users');
  return data;
};

export const getUserById = async (userId) => {
 
  const { data } = await axiosAdmin.get('/auth/users');
  const users = Array.isArray(data) ? data : (data?.users || []);
  const uid = String(userId || '').toLowerCase();
  const found = users.find((u) => {
    const candidates = [u?.id, u?.Id, u?._id, u?.username, u?.Username, u?.Email, u?.email].filter(Boolean);
    return candidates.some((c) => String(c).toLowerCase() === uid);
  });
  return found || null;
};
