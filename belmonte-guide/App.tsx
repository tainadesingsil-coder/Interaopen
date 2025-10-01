import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { useBelFonts } from './src/hooks/useBelFonts';

export default function App() {
  const fontsLoaded = useBelFonts();
  if (!fontsLoaded) return null;
  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}
