import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { FeedScreen } from '../screens/FeedScreen';
import { CreateContentScreen } from '../screens/CreateContentScreen';
import { WatchPartyScreen } from '../screens/WatchPartyScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: '#0F1117',
    text: colors.text,
    border: '#202531',
    primary: colors.primary,
    notification: colors.accent,
  },
};

export function RootTabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#0F1117',
            borderTopColor: '#202531',
          },
          tabBarIcon: ({ color, size, focused }) => {
            const name =
              route.name === 'Feed' ? 'home-variant' :
              route.name === 'Criar Conteúdo' ? 'plus-box' :
              route.name === 'Watch Party' ? 'play-circle' :
              'account-circle';
            return <MaterialCommunityIcons name={name as any} color={focused ? colors.primary : '#8A94A7'} size={24} />;
          },
        })}
      >
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Criar Conteúdo" component={CreateContentScreen} />
        <Tab.Screen name="Watch Party" component={WatchPartyScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}