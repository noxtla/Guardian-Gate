// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet, useWindowDimensions, View, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';

// Importaciones de reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// CustomTabBar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { width } = useWindowDimensions();
  const NUMBER_OF_TABS = state.routes.length;
  const TAB_ITEM_WIDTH = width / NUMBER_OF_TABS;

  const translateX = useSharedValue(0);

  useEffect(() => {
    const targetX = state.index * TAB_ITEM_WIDTH;
    translateX.value = withTiming(targetX, { duration: 300, easing: Easing.out(Easing.quad) });
  }, [state.index, width, TAB_ITEM_WIDTH]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: TAB_ITEM_WIDTH,
      height: '100%',
      position: 'absolute',
      borderRadius: 25,
      backgroundColor: Colors.brand.lightBlue,
      paddingHorizontal: 0,
    };
  });

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View style={pillAnimatedStyle} />

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, { width: TAB_ITEM_WIDTH }]}
          >
            <IconSymbol
              name={options.tabBarIcon ? options.tabBarIcon({ color: Colors.brand.white }).props.name : 'questionmark.circle.fill'}
              color={isFocused ? Colors.brand.white : Colors.brand.gray}
              size={28}
            />
            {isFocused && (
              <Animated.Text style={styles.tabLabel}>
                {label}
              </Animated.Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol name="message.fill" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="Notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <IconSymbol name="bell.fill" color={color} size={28} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol name="person.fill" color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: Colors.brand.darkBlue,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabLabel: {
    color: Colors.brand.white,
    fontSize: 14,
    fontWeight: '600',
  },
});