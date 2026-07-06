// src/navigation/AuthStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
