// ─── FlowNote Streak — Root Layout ────────────────────
// Redesigned with inline vector SVG bottom navigation
// matching the reference design (home, journal, settings icons)

import React from 'react';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  StyleSheet,
  ColorValue,
  Text,
  TextInput,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useFonts, Saira_400Regular, Saira_500Medium, Saira_600SemiBold, Saira_700Bold } from '@expo-google-fonts/saira';
import { colors, fonts, spacing } from '../src/lib/theme';

let defaultFontConfigured = false;
const DefaultText = Text as typeof Text & { defaultProps?: { style?: unknown } };
const DefaultTextInput = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Simple SVG icon components
function HomeIcon({ focused, color, size = 26 }: { focused: boolean; color: ColorValue; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {focused ? (
        <Path
          d="M3 9.5 L12 2.5 L21 9.5 V20 A1.5 1.5 0 0 1 19.5 21.5 H14.5 V14.5 H9.5 V21.5 H4.5 A1.5 1.5 0 0 1 3 20 Z"
          fill={color}
        />
      ) : (
        <>
          <Path
            d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9 22V12h6v10"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
}

function JournalIcon({ color, size = 26 }: { color: ColorValue; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7l-5-5z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 2v5h5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 12h8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M8 16h8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SettingsIcon({ color, size = 26 }: { color: ColorValue; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="12"
        r="2.5"
        fill={color}
      />
    </Svg>
  );
}

const tabLabels: Record<string, string> = {
  index: 'Home',
  journal: 'Notes',
  settings: 'Settings',
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: ColorValue }) {
  if (name === 'index') return <HomeIcon focused={focused} color={color} />;
  if (name === 'journal') return <JournalIcon color={color} />;
  return <SettingsIcon color={color} />;
}

function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = tabLabels[route.name] ?? options.title ?? route.name;
          const iconColor = focused ? colors.primary : colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={({ pressed }) => [
                styles.tabItem,
                focused ? styles.tabItemActive : styles.tabItemInactive,
                pressed && styles.tabItemPressed,
              ]}
            >
              <TabIcon name={route.name} focused={focused} color={iconColor} />
              {focused && <Text style={styles.tabLabel}>{label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Saira_400Regular,
    Saira_500Medium,
    Saira_600SemiBold,
    Saira_700Bold,
  });

  if (!fontsLoaded) return null;

  if (!defaultFontConfigured) {
    DefaultText.defaultProps = DefaultText.defaultProps ?? {};
    DefaultText.defaultProps.style = [DefaultText.defaultProps.style, { fontFamily: fonts.regular }];
    DefaultTextInput.defaultProps = DefaultTextInput.defaultProps ?? {};
    DefaultTextInput.defaultProps.style = [DefaultTextInput.defaultProps.style, { fontFamily: fonts.regular }];
    defaultFontConfigured = true;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Notes',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  tabBar: {
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  tabBarContent: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tabItem: {
    height: '100%',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabItemActive: {
    flex: 1.65,
    backgroundColor: 'rgba(85, 234, 77, 0.13)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.25)',
  },
  tabItemInactive: {
    flex: 1,
  },
  tabItemPressed: {
    opacity: 0.75,
  },
  tabLabel: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: '600',
  },
});
