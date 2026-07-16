// ─── FlowNote Streak — Root Layout ────────────────────
// Redesigned with Material 3 icon-based bottom navigation
// matching the reference design (home, journal, settings icons)

import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../src/lib/theme';

// Simple text-based icon component to avoid external icon library dependency
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '⌂',
    journal: '☰',
    settings: '⚙',
  };

  return (
    <Text
      style={[
        styles.icon,
        { color: focused ? colors.primary : colors.textMuted },
        focused && styles.iconActive,
      ]}
    >
      {icons[name] || '•'}
    </Text>
  );
}

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bg,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: 'rgba(255,255,255,0.05)',
            height: 72,
            paddingBottom: 16,
            paddingTop: 10,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: typography.navItem,
            fontWeight: '500',
            letterSpacing: 0.04 * typography.navItem,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ focused }) => <TabIcon name="journal" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  icon: {
    fontSize: 24,
    lineHeight: 28,
  },
  iconActive: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
