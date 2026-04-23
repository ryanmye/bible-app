import React from 'react';
import { Pressable, View } from 'react-native';
import { Screen, Text, useTheme } from '../../ui';
import { useSettingsStore, type ThemeOverride } from '../../app/stores/settingsStore';
import { SyncProviderRegistry } from '../../data/sync';

const THEME_OPTIONS: ThemeOverride[] = ['system', 'light', 'dark'];

export function SettingsScreen() {
  const theme = useTheme();
  const { themeOverride, syncProviderId, setThemeOverride, setSyncProviderId } =
    useSettingsStore();
  const providers = SyncProviderRegistry.list();

  return (
    <Screen>
      <Text variant="headingLg" style={{ marginBottom: theme.spacing.md }}>
        Settings
      </Text>

      <Text variant="heading" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
        Theme
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        {THEME_OPTIONS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setThemeOverride(t)}
            style={{
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor:
                themeOverride === t ? theme.colors.accent : theme.colors.bgElevated,
            }}
          >
            <Text
              style={{
                color:
                  themeOverride === t ? theme.colors.accentContrast : theme.colors.text,
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text variant="heading" style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.sm }}>
        Sync provider
      </Text>
      <View style={{ gap: theme.spacing.sm }}>
        {providers.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setSyncProviderId(p.id)}
            style={{
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor:
                syncProviderId === p.id ? theme.colors.accent : theme.colors.border,
              backgroundColor: theme.colors.bgElevated,
            }}
          >
            <Text style={{ fontWeight: '600' }}>{p.displayName}</Text>
            <Text variant="muted">{p.id}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
