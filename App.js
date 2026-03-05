import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './context/AuthContext'; // <- Asegúrate de tener este archivo

import HomeScreen from './screens/HomeScreen';
import MovilidadScreen from './screens/MovilidadScreen';
import EnergiaScreen from './screens/EnergiaScreen';
import SeguridadScreen from './screens/SeguridadScreen';
import InclusionScreen from './screens/InclusionScreen';
import EconomiaScreen from './screens/EconomiaScreen';
import ParticipacionScreen from './screens/ParticipacionScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AuthScreen from './screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const palette = {
  active: '#1a237e',
  inactive: 'gray',
  surface: 'white',
};

function AppLoader() {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#1a237e" />
      <Text style={{ marginTop: 16, color: '#1a237e' }}>Cargando sesión...</Text>
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Movilidad') {
            iconName = focused ? 'walk' : 'walk-outline';
          } else if (route.name === 'Energia') {
            iconName = focused ? 'flash' : 'flash-outline';
          } else if (route.name === 'Seguridad') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'Inclusion') {
            iconName = focused ? 'hand-left' : 'hand-left-outline';
          } else if (route.name === 'Economia') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Participacion') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: palette.active,
        tabBarInactiveTintColor: palette.inactive,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
          backgroundColor: palette.surface,
          borderTopWidth: 1,
          borderTopColor: '#e3e6ea',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Movilidad" component={MovilidadScreen} />
      <Tab.Screen name="Energia" component={EnergiaScreen} />
      <Tab.Screen name="Seguridad" component={SeguridadScreen} />
      <Tab.Screen name="Inclusion" component={InclusionScreen} />
      <Tab.Screen name="Economia" component={EconomiaScreen} />
      <Tab.Screen name="Participacion" component={ParticipacionScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading, session } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  const isEmailVerified = Boolean(session?.user?.email_confirmed_at);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user && isEmailVerified ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Perfil" component={ProfileScreen} />
          <Stack.Screen name="EditarPerfil" component={EditProfileScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#f5f8fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});