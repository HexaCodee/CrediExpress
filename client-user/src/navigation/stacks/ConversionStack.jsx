// src/navigation/stacks/ConversionStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConversionHistoryScreen from '../../features/conversion/screens/ConversionHistoryScreen';
import ConversionScreen from '../../features/conversion/screens/ConversionScreen';

const Stack = createNativeStackNavigator();

export default function ConversionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="ConversionHome" component={ConversionScreen} />
      <Stack.Screen name="ConversionHistory" component={ConversionHistoryScreen} />
    </Stack.Navigator>
  );
}
