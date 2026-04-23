import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from '../ui/theme/ThemeProvider';
import { AppDrawer } from '../navigation/AppDrawer';
import { installSeed } from '../data/seed/installSeed';
import { useLibraryStore } from './stores/libraryStore';
import { Text } from '../ui/components/Text';

export function AppRoot() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Bootstrapper />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Bootstrapper() {
  const theme = useTheme();
  const reload = useLibraryStore((s) => s.reload);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<string>('Starting...');

  useEffect(() => {
    (async () => {
      try {
        setStatus('Installing bundled Bibles...');
        const result = await installSeed();
        if (result.reason === 'no-seed-found') {
          setStatus(
            'No seed.sqlite in app bundle. Run `npm run seed:build` and add it to Xcode "Copy Bundle Resources", then relaunch.',
          );
        }
        await reload();
      } catch (e) {
        setStatus(`Bootstrap error: ${String(e)}`);
      } finally {
        setReady(true);
      }
    })();
  }, [reload]);

  if (!ready) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: theme.color.background },
        ]}
      >
        <ActivityIndicator />
        <Text muted style={{ marginTop: 12 }}>
          {status}
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.mode === 'dark',
        colors: {
          background: theme.color.background,
          border: theme.color.border,
          card: theme.color.surface,
          notification: theme.color.accent,
          primary: theme.color.accent,
          text: theme.color.textPrimary,
        },
        fonts: {
          regular: { fontFamily: theme.font.body, fontWeight: '400' },
          medium: { fontFamily: theme.font.body, fontWeight: '500' },
          bold: { fontFamily: theme.font.body, fontWeight: '700' },
          heavy: { fontFamily: theme.font.body, fontWeight: '800' },
        },
      }}
    >
      <AppDrawer />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
