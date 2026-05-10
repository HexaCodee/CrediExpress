import { create } from "zustand";
import {
  getallUsers as getAllUsersRequest,
  updateUser as updateUserRequest,
  deleteUser as deleteUserRequest,
} from "../../../shared/apis";

export const useUserManagementStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,
    filters: {},

    setFilters: (filters) => set({ filters }),

    setUser: (user) => set({ users: user }),

    getAllUsers: async (apiFn = getAllUsersRequest, options = {}) => {
        try {
            const { force = false } = options;
            const state = get();

            if (state.loading) return;
            if (!force && state.users.length > 0) return;

            set({ loading: true, error: null });

            const fetcher = typeof apiFn === "function" ? apiFn : getAllUsersRequest;
            const response = await fetcher();

            set({
                users: response.users || response,
                loading: false,
            });
        } catch (err) {
            set({
                error: err.response?.data?.message || "Error al obtener los usuarios",
                loading: false,
            });
        }
    },

    updateUser: async (userId, formData) => {
      try {
        set({ loading: true, error: null });
        await updateUserRequest(userId, formData);
        await get().getAllUsers(undefined, { force: true });
        set({ loading: false });
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Error al actualizar el usuario";
        set({ error: message, loading: false });
        return { success: false, error: message };
      }
    },

    toggleUserStatus: async (user) => {
      try {
        set({ loading: true, error: null });
        const newStatus = !user.status; 

        set((state) => ({
          users: state.users.map((u) => u.id === user.id ? { ...u, status: newStatus } : u),
        }));
        const formData = new FormData();
        formData.append('status', newStatus.toString());
        await updateUserRequest(user.id, formData);
        await get().getAllUsers(undefined, { force: true });
        set({ loading: false });
        return { success: true };
      } catch (err) {
        set((state) => ({
          users: state.users.map((u) => u.id === user.id ? { ...u, status: user.status } : u),
        }));
        const action = user.status ? "deshabilitar" : "habilitar";
        const message =
          err.response?.data?.message || `Error al ${action} el usuario`;
        set({ error: message, loading: false });
        return { success: false, error: message };
      }
    },
}));