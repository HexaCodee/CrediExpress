// src/navigation/stacks/FavoritesStack.jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateFavoriteScreen from '../../features/favorites/screens/CreateFavoriteScreen';
import FavoriteDetailScreen from '../../features/favorites/screens/FavoriteDetailScreen';
import FavoritesScreen from '../../features/favorites/screens/FavoritesScreen';

const Stack = createNativeStackNavigator();

export default function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="FavoritesList" component={FavoritesScreen} />
      <Stack.Screen name="FavoriteDetail" component={FavoriteDetailScreen} />
      <Stack.Screen name="CreateFavorite" component={CreateFavoriteScreen} />
    </Stack.Navigator>
  );
}
