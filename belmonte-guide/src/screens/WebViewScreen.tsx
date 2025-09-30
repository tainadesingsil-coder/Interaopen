import React, { useRef, useState, useCallback } from 'react';
import { View, ActivityIndicator, RefreshControl, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 12; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

export default function WebViewScreen({ uri }: { uri: string }) {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webRef.current?.reload();
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        source={{ uri }}
        userAgent={Platform.select({ ios: undefined, android: MOBILE_UA })}
        startInLoadingState
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        pullToRefreshEnabled
        allowsBackForwardNavigationGestures
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        renderLoading={() => (
          <View style={styles.loader}><ActivityIndicator size="large" /></View>
        )}
        injectedJavaScriptBeforeContentLoaded={`(function(){
          var m = document.createElement('meta');
          m.name='viewport';
          m.content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
          document.head.appendChild(m);
        })(); true;`}
      />
      {loading && (
        <View style={styles.loaderOverlay} pointerEvents="none">
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loaderOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center'
  }
});