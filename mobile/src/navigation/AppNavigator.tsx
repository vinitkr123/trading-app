import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Auth = createStackNavigator();

function AuthNavigator() {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="Login" component={LoginScreen} />
      <Auth.Screen name="Register" component={RegisterScreen} />
    </Auth.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0D1117', borderBottomColor: '#30363D' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#161B22', borderTopColor: '#30363D' },
        tabBarActiveTintColor: '#00D4AA',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Portfolio: focused ? 'briefcase' : 'briefcase-outline',
            Watchlists: focused ? 'eye' : 'eye-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Watchlists" component={WatchlistScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    loadUser().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D1117', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#00D4AA" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen
              name="StockDetail"
              component={StockDetailScreen}
              options={({ route }: any) => ({
                headerShown: true,
                title: route.params?.symbol ?? 'Stock',
                headerStyle: { backgroundColor: '#0D1117' },
                headerTintColor: '#fff',
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
