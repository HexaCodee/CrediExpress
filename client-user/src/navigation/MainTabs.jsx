// src/navigation/MainTabs.jsx
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ImageBackground, StyleSheet, View } from 'react-native';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import { COLORS } from '../shared/constants/theme';
import AccountsStack from './stacks/AccountsStack';
import ConversionStack from './stacks/ConversionStack';
import FavoritesStack from './stacks/FavoritesStack';
import TransfersStack from './stacks/TransfersStack';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  AccountsTab: 'account-balance-wallet',
  FavoritesTab: 'star',
  ConversionTab: 'swap-horiz',
  TransfersTab: 'sync-alt',
  ProfileTab: 'person',
};

export default function MainTabs() {
  return (
    <ImageBackground
      source={require('../../assets/authBackground.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: route.name === 'ProfileTab',
            sceneStyle: styles.sceneContainer,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.secondary,
            tabBarStyle: {
              backgroundColor: COLORS.surface,
              height: 60,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            },
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={TAB_ICONS[route.name]} color={color} size={size} />
            ),
          })}
        >
          <Tab.Screen name="AccountsTab" component={AccountsStack} options={{ tabBarLabel: 'Cuentas' }} />
          <Tab.Screen name="FavoritesTab" component={FavoritesStack} options={{ tabBarLabel: 'Favoritos' }} />
          <Tab.Screen name="ConversionTab" component={ConversionStack} options={{ tabBarLabel: 'Cambio' }} />
          <Tab.Screen name="TransfersTab" component={TransfersStack} options={{ tabBarLabel: 'Transferencias' }} />
          <Tab.Screen
            name="ProfileTab"
            component={ProfileScreen}
            options={{ tabBarLabel: 'Perfil', title: 'Mi perfil' }}
          />
        </Tab.Navigator>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.90)',
  },
  sceneContainer: {
    backgroundColor: 'transparent',
  },
});
