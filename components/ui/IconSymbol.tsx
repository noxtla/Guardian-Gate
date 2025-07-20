// components/ui/IconSymbol.tsx

// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * THIS IS OUR SINGLE SOURCE OF TRUTH FOR ICONS.
 * - Keys are SF Symbol names (for iOS).
 * - Values are Material Icons names (for Android/Web).
 * - All icons used in the app MUST be defined here.
 */
const MAPPING: IconMapping = {
  // CAMBIO CLAVE AQUÍ: 'shield.fill' ahora mapea a 'privacy-tip'
  'shield.fill': 'privacy-tip', // Icon for login/security screens
  'faceid': 'tag-faces',

  // Tab Bar Icons
  'house.fill': 'home',
  'message.fill': 'sms',
  'bell.fill': 'notifications',
  'person.fill': 'person',

  // --- REMOVED: The camera icon mapping is no longer needed. ---
  // 'camera.fill': 'camera-alt',

  // Home Screen Grid Icons
  'person.badge.clock.fill': 'badge', // Attendance
  'car.fill': 'directions-car', // Vehicles
  'list.bullet.clipboard.fill': 'assignment', // Job Briefing
  'heart.shield.fill': 'health-and-safety', // Safety
  'wrench.and.screwdriver.fill': 'build', // Work
  'exclamationmark.bubble.fill': 'support-agent', // Ticket (Support)

  // Chat Screen Icons
  'arrow.backward': 'arrow-back', // For the back button in the chat header
  'paperclip.fill': 'attach-file', // For the attachment icon in the input bar
  'paperplane.fill': 'send', // Already mapped from previous work, used for the send button

  // Notification Screen Icons
  'rectangle.fill.on.rectangle.fill': 'data-usage', // Generic system/server icon for SystemTreeService

  // Profile Screen Icons
  'gearshape.fill': 'settings', // Settings icon for profile
  'arrow.left': 'arrow-back', // Back arrow for Edit Profile page
  'arrow.right': 'arrow-forward', // Forward arrow for list items
  'door.right.hand.open.fill': 'logout', // Sign out icon
  'bolt.fill': 'flash-on', // Placeholder for activity chart (or any dynamic data)
  'calendar': 'calendar-today', // Joined date (used in ProfileInfo and now in YearScreen)
  'clock.fill': 'schedule', // Last active
  'person.2.fill': 'people', // Followers/Following
  'chart.bar.fill': 'bar-chart', // Contributions (or general stats)
};

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  if (!MAPPING[name]) {
    // Optionally log a warning for unmapped icons in development
    if (__DEV__) {
      console.warn(`IconSymbol: No MaterialIcons mapping found for SF Symbol "${name}"`);
    }
    return null; // Or return a fallback icon
  }
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}