import { axiosAuth, axiosAdmin } from "./api.js";

export const login = async (data) => {
    return await axiosAuth.post("/Log/login", data);
};

export const getallUsers = async () => {
    const { data } = await axiosAdmin.get("/auth/users");
    return data;
};

export const register = async (data) => {
  const { data: response } = await axiosAdmin.post('/auth/register', data);
  return response;
};

export const updateUser = async (userId, data) => {
  const { data: response } = await axiosAdmin.put(`/auth/users/${userId}`, data);
  return response;
};

export const deleteUser = async (userId) => {
  const { data: response } = await axiosAdmin.delete(`/auth/users/${userId}`);
  return response;
};