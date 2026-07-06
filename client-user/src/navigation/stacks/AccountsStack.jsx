// src/navigation/stacks/AccountsStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountDetailScreen from '../../features/accounts/screens/AccountDetailScreen';
import AccountsScreen from '../../features/accounts/screens/AccountsScreen';

const Stack = createNativeStackNavigator();

export default function AccountsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="AccountsList" component={AccountsScreen} />
      <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
    </Stack.Navigator>
  );
}
