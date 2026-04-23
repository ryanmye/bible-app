import React from 'react';
import { Screen, Text } from '../../ui';

/**
 * Template for a new feature screen. Copy this folder to create a new one:
 *   features/<name>/<Name>Screen.tsx
 *   features/<name>/index.ts
 * Then register it in src/navigation/AppDrawer.tsx.
 */
export function TemplateScreen() {
  return (
    <Screen>
      <Text variant="headingLg">Template</Text>
      <Text variant="subtle">Replace with your feature.</Text>
    </Screen>
  );
}
