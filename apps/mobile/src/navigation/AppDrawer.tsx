import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { ReaderScreen } from '../features/reader';
import { LibraryScreen } from '../features/library';
import { NotesScreen } from '../features/notes';
import { HighlightsScreen } from '../features/highlights';
import { SearchScreen } from '../features/search';
import { SettingsScreen } from '../features/settings';

export type AppDrawerParamList = {
  Reader: undefined;
  Library: undefined;
  Notes: undefined;
  Highlights: undefined;
  Search: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<AppDrawerParamList>();

export function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Reader"
      screenOptions={{
        drawerType: 'permanent',
      }}
    >
      <Drawer.Screen name="Reader" component={ReaderScreen} />
      <Drawer.Screen name="Library" component={LibraryScreen} />
      <Drawer.Screen name="Notes" component={NotesScreen} />
      <Drawer.Screen name="Highlights" component={HighlightsScreen} />
      <Drawer.Screen name="Search" component={SearchScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}
