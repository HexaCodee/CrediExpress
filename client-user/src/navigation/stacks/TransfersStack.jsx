// src/navigation/stacks/TransfersStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateTransferScreen from '../../features/transfers/screens/CreateTransferScreen';
import TransfersScreen from '../../features/transfers/screens/TransfersScreen';

const Stack = createNativeStackNavigator();

export default function TransfersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="TransfersList" component={TransfersScreen} />
      <Stack.Screen name="CreateTransfer" component={CreateTransferScreen} />
    </Stack.Navigator>
  );
}
