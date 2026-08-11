// ─── MinFit — Root Layout ─────────────────────────────
// Redesigned with inline vector SVG bottom navigation
// matching the reference design (home, journal, settings icons)

import React, { useEffect, useRef } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useFonts } from 'expo-font';
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

interface TabButtonProps {
  focused: boolean;
  label: string;
  routeName: string;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
}

function TabButton({
  focused,
  label,
  routeName,
  accessibilityLabel,
  onPress,
  onLongPress,
}: TabButtonProps) {
  const openAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(openAnim, {
      toValue: focused ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [focused, openAnim]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.tabItem,
        focused ? styles.tabItemActive : styles.tabItemInactive,
        pressed && styles.tabItemPressed,
      ]}
    >
      <Animated.View
        style={[
          styles.activePill,
          {
            opacity: openAnim,
            transform: [{ scaleX: openAnim.interpolate({ inputRange: [0, 1], outputRange: [0.34, 1] }) }],
          },
        ]}
      />
      <View style={styles.tabContent}>
        <TabIcon
          name={routeName}
          focused={focused}
          color={focused ? colors.primary : colors.textMuted}
        />
        {focused && (
          <Animated.Text
            style={[
              styles.tabLabel,
              {
                opacity: openAnim,
                transform: [{ translateX: openAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
              },
            ]}
          >
            {label}
          </Animated.Text>
        )}
      </View>
    </Pressable>
  );
}

function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  if (state.routes[state.index]?.name === 'year') return null;

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.tabBarContent}>
        {state.routes.filter((route) => route.name !== 'year').map((route) => {
          const focused = state.routes[state.index]?.key === route.key;
          const { options } = descriptors[route.key];
          const label = tabLabels[route.name] ?? options.title ?? route.name;

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
            <TabButton
              key={route.key}
              focused={focused}
              label={label}
              routeName={route.name}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Nippo-Regular': require('../assets/fonts/Nippo/Fonts/OTF/Nippo-Regular.otf'),
    'Nippo-Medium': require('../assets/fonts/Nippo/Fonts/OTF/Nippo-Medium.otf'),
    'Nippo-Bold': require('../assets/fonts/Nippo/Fonts/OTF/Nippo-Bold.otf'),
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
          animation: 'fade',
          sceneStyle: { backgroundColor: colors.bg },
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
        <Tabs.Screen
          name="year"
          options={{
            href: null,
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
    overflow: 'hidden',
  },
  tabItemActive: {
    flex: 1.65,
  },
  tabItemInactive: {
    flex: 1,
  },
  tabItemPressed: {
    opacity: 0.75,
  },
  activePill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 26,
    backgroundColor: 'rgba(85, 234, 77, 0.13)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.25)',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 1,
  },
  tabLabel: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: '600',
  },
});
