/**
 * Bible App entry.
 *
 * Delegates to src/app/AppRoot which owns the providers, seed-install
 * bootstrapping, and navigation container.
 */
import 'react-native-gesture-handler';
import React from 'react';

import { AppRoot } from './src/app/AppRoot';

export default function App() {
  return <AppRoot />;
}
