import { Navigate } from "react-router-dom"
import { Spinner } from "../../features/auth/components/Spinner.jsx";
import { useAuthStore } from "../../features/auth/store/authStore.js"

export const ProtectedRoutes = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

    if(isLoadingAuth) return <Spinner />;

    if(!isAuthenticated) return <Navigate to="/" replace />

    return children;
}