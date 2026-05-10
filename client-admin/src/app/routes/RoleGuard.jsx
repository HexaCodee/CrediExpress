import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  // 🔐 PASO 10: Valida que el usuario tenga el rol correcto
  // En este caso: solo ADMIN_ROLE puede acceder al dashboard
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const hasAccess = isAuthenticated && allowedRoles.includes(user?.role);

  if (!hasAccess) {
    return <Navigate to='/' replace />; // ❌ Sin rol correcto → redirige
  }

  return children; // ✅ Rol válido → permite acceso
};
