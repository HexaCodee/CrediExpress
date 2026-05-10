import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as loginRequest, register as registerRequest } from "../../../shared/apis";
import { showError } from "../../../shared/utils/toast.js";

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
                const role = get().user?.role;
                const isAdmin = role === "BANK_ADMIN";

                if (!token || !isAdmin) {
                    set({
                        user: null,
                        token: null,
                        refreshToken: null,
                        expiresAt: null,
                        isLoadingAuth: false,
                        isAuthenticated: false,
                        error: token ? "Usuario no autorizado" : null,
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
                    //------------------------------------------------------------------------------------
                    const { data } = await loginRequest({ emailOrUsername, password });

                    console.log("DATA BACKEND:", data);

                    // Adaptación flexible a diferentes respuestas del backend
                    const token = data?.accessToken || data?.token;
                    const refresh = data?.refreshToken || null;;
                    const user = data?.userDetails || data?.user;

                    if (!token ||/* !refresh || */ !user) {
                        throw new Error("Respuesta inválida del servicio de autenticación");
                    }
                    //------------------------------------------------------------------------------------
                    const role = user?.role;
                    if (role !== "BANK_ADMIN") {
                        const message = "Usuario no autorizado";

                        set({
                            user: null,
                            token: null,
                            refreshToken: null,
                            expiresAt: null,
                            isLoadingAuth: false,
                            isAuthenticated: false,
                            error: message,
                            loading: false,
                        });

                        showError(message);
                        return { success: false, error: message };
                    }

                    const expiresIn = Number(data.expiresIn);
                    const expiresAt = Number.isFinite(expiresIn) && expiresIn > 0
                        ? Date.now() + expiresIn * 1000
                        : null;
                    //------------------------------------------------------------------------------------
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
                    //------------------------------------------------------------------------------------
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
        })),
);