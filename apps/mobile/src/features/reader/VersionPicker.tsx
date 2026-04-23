import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text, useTheme } from '../../ui';
import type { Version } from '../../domain/bible/types';

type Props = {
  versions: Version[];
  selected: string;
  onSelect: (id: string) => void;
};

export function VersionPicker({ versions, selected, onSelect }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const current = versions.find((v) => v.id === selected);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.bgElevated,
        }}
      >
        <Text style={{ fontWeight: '600' }}>{current?.abbreviation ?? selected}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' }}
        >
          <View
            style={{
              backgroundColor: theme.colors.bg,
              marginHorizontal: theme.spacing.xl,
              padding: theme.spacing.lg,
              borderRadius: theme.radius.lg,
              gap: theme.spacing.sm,
            }}
          >
            <Text variant="heading">Choose version</Text>
            {versions.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => {
                  onSelect(v.id);
                  setOpen(false);
                }}
                style={{
                  paddingVertical: theme.spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <Text>{v.name}</Text>
                <Text variant="muted">{v.abbreviation}</Text>
              </Pressable>
            ))}
            {versions.length === 0 && <Text variant="muted">No versions installed yet.</Text>}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
