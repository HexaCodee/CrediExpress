// src/navigation/AppNavigator.jsx
import { NavigationContainer } from '@react-navigation/native';
import { LoadingSpinner } from '../shared/components/common/Common';
import { useAuthStore } from '../shared/store/authStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

export default function AppNavigator() {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!hasHydrated) {
    return <LoadingSpinner label="Cargando sesión..." />;
  }

  return <NavigationContainer>{isAuthenticated ? <MainTabs /> : <AuthStack />}</NavigationContainer>;
}
