import { Alert, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export async function shareLink(url: string, title?: string, text?: string) {
  try {
    // @ts-ignore web share
    if (typeof navigator !== 'undefined' && navigator.share) {
      // @ts-ignore
      await navigator.share({ url, title, text });
      return;
    }
  } catch {}
  await Clipboard.setStringAsync(url);
  Alert.alert('Link copiado', 'O link foi copiado para a área de transferência.');
}