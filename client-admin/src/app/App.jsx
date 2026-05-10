import { useEffect } from "react";
import { Toaster } from "react-hot-toast"
import { AppRoutes } from "./routes/AppRoutes.jsx";
import { useAuthStore } from "../features/auth/store/authStore.js";
import { UiConfirmHost } from "../features/auth/components/ConfirmModal.jsx";

export const App = () => {

  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            fontWeight: "600",
            fontSize: "1rem",
            borderRadius: "8px",
          }
        }}
      />
      <AppRoutes />,
      <UiConfirmHost />
    </>
  )
}
