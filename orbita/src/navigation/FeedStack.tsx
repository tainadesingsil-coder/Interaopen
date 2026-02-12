import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedScreen } from '../screens/FeedScreen';
import { ReelsScreen } from '../screens/ReelsScreen';

export type FeedStackParamList = {
  FeedHome: undefined;
  Reels: undefined;
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedHome" component={FeedScreen} />
      <Stack.Screen name="Reels" component={ReelsScreen} />
    </Stack.Navigator>
  );
}