import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import WelcomeScreen from '@/screens/WelcomeScreen';
import HomeScreen from '@/screens/HomeScreen';
import MapScreen from '@/screens/MapScreen';
import GastronomyScreen from '@/screens/GastronomyScreen';
import BelAIScreen from '@/screens/BelAIScreen';
import ItinerariesScreen from '@/screens/ItinerariesScreen';
import CommerceScreen from '@/screens/CommerceScreen';
import EventsScreen from '@/screens/EventsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.sunsetGold,
    background: colors.white,
    card: colors.white,
    text: colors.deepBlue,
    border: '#E6EAF1',
    notification: colors.sunsetGold,
  },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.sunsetGold,
        tabBarInactiveTintColor: colors.deepBlue,
        tabBarStyle: { borderTopColor: 'transparent', elevation: 0 },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Início: 'sparkles-outline',
            Mapa: 'map-outline',
            Gastronomia: 'restaurant-outline',
            BelAI: 'chatbubble-ellipses-outline',
            Roteiros: 'albums-outline',
            Comércio: 'storefront-outline',
            Eventos: 'calendar-outline',
            Perfil: 'person-circle-outline',
          };
          const name = iconMap[route.name] || 'ellipse-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Gastronomia" component={GastronomyScreen} />
      <Tab.Screen name="BelAI" component={BelAIScreen} />
      <Tab.Screen name="Roteiros" component={ItinerariesScreen} />
      <Tab.Screen name="Comércio" component={CommerceScreen} />
      <Tab.Screen name="Eventos" component={EventsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

