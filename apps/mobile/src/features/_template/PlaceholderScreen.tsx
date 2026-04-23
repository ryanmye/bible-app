import React from 'react';

import { Screen, Text } from '../../ui';

export function PlaceholderScreen() {
  return (
    <Screen>
      <Text variant="title">New feature</Text>
      <Text muted>Copy this folder, rename, register in navigation.</Text>
    </Screen>
  );
}
