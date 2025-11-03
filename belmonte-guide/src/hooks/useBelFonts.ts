import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

export function useBelFonts() {
  const [fontsLoaded] = useFonts({ Poppins_700Bold, Montserrat_400Regular, Montserrat_700Bold });
  return fontsLoaded;
}

