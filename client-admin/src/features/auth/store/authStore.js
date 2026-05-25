import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginRequest, register as registerRequest } from "../../../shared/apis";
import { normalizeUserModel } from "../../../shared/utils/user.js";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            loading: false,
            error: null,
            isLoadingAuth: true,
            isAuthenticated: false,
            checkAuth: () => {
                const token = get().token;

                if (!token) {
                    set({
                        user: null,
                        token: null,
                        refreshToken: null,
                        expiresAt: null,
                        isLoadingAuth: false,
                        isAuthenticated: false,
                        error: null,
                    });
                    return;
                }

                set({
                    isLoadingAuth: false,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    expiresAt: null,
                    isAuthenticated: false,
                })
            },

            login: async ({ emailOrUsername, password }) => {
                try {
                    set({ loading: true, error: null });
                    
                    const { data } = await loginRequest({ emailOrUsername, password });

                    console.log("DATA BACKEND:", data);

                    const token = data?.accessToken || data?.token || data?.AccessToken || data?.Token;
                    const refresh = data?.refreshToken || data?.RefreshToken || null;
                    const rawUser =
                        data?.userDetails ||
                        data?.user ||
                        data?.User ||
                        data?.userDetails ||
                        data?.UserDetails ||
                        data;
                    const user = normalizeUserModel(rawUser);

                    if (!token || !user) {
                        throw new Error("Respuesta inválida del servicio de autenticación");
                    }
                    

                    const expiresIn = Number(data.expiresIn || data?.ExpiresIn || data?.expires_in || 0);
                    const expiresAt = Number.isFinite(expiresIn) && expiresIn > 0
                        ? Date.now() + expiresIn * 1000
                        : null;
                    
                    set({
                        user: user,
                        token: token,
                        refreshToken: refresh,
                        expiresAt,
                        isAuthenticated: true,
                        loading: false,
                        isLoadingAuth: false,
                        error: null,
                    });
                    
                    return { success: true };
                } catch (err) {
                    const message =
                        err.response?.data?.message ||
                        err.message ||
                        "Error al iniciar sesión";
                    set({ error: message, loading: false, isLoadingAuth: false });
                    return { success: false, error: message };
                }
            },

            register: async (formData) => {
                try {
                    set({ loading: true, error: null });
                    const response = await registerRequest(formData);
                    set({ loading: false });
                    return { success: true, data: response };
                } catch (err) {
                    const message =
                        err.response?.data?.message ||
                        err.message ||
                        "Error al registrar usuario";
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            }
        }),
        {
            name: 'auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                expiresAt: state.expiresAt,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);