import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  ReaderScreen,
  LibraryScreen,
  NotesScreen,
  HighlightsScreen,
  SearchScreen,
  SettingsScreen,
} from '../features';

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
      screenOptions={{ headerShown: true, drawerType: 'front' }}
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
