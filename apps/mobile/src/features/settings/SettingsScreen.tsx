import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, Row, Screen, Text, useTheme } from '../../ui';
import {
  useThemePreference,
  type ThemePreference,
} from '../../ui/theme/ThemeProvider';
import { syncProviders } from '../../data/sync/SyncProviderRegistry';

export function SettingsScreen() {
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();
  const [activeSyncId, setActiveSyncId] = useState(
    syncProviders.getActive().id,
  );
  const providers = syncProviders.list();

  const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: theme.space(3) }}>
        Settings
      </Text>

      <View style={{ marginBottom: theme.space(4) }}>
        <Text style={{ fontWeight: '600', marginBottom: theme.space(2) }}>
          Theme
        </Text>
        <Row gap={8} wrap>
          {themeOptions.map((opt) => (
            <Button
              key={opt}
              label={opt}
              variant={opt === preference ? 'primary' : 'secondary'}
              onPress={() => setPreference(opt)}
            />
          ))}
        </Row>
      </View>

      <View style={{ marginBottom: theme.space(4) }}>
        <Text style={{ fontWeight: '600', marginBottom: theme.space(2) }}>
          Sync provider
        </Text>
        <Row gap={8} wrap>
          {providers.map((p) => (
            <Button
              key={p.id}
              label={p.displayName}
              variant={p.id === activeSyncId ? 'primary' : 'secondary'}
              onPress={() => {
                syncProviders.setActive(p.id);
                setActiveSyncId(p.id);
              }}
            />
          ))}
        </Row>
        <Text variant="caption" style={{ marginTop: theme.space(2) }}>
          Pluggable: register Supabase or Firebase adapters in{' '}
          <Text variant="mono">src/data/sync/SyncProviderRegistry.ts</Text>.
        </Text>
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: theme.space(2) }}>
          About
        </Text>
        <Text muted>
          Bible App foundation — React Native 0.81, op-sqlite, local-first with
          pluggable cloud sync.
        </Text>
      </View>
    </Screen>
  );
}
