// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // IMPORTANTE: Ocultamos el header que las pestañas intentarían crear
        // porque el layout padre ya lo está proporcionando.
        headerShown: false,
        
        // Opciones del Tab Bar (Footer)
        tabBarActiveTintColor: Colors.brand.lightBlue,
        tabBarInactiveTintColor: Colors.brand.gray,
        tabBarStyle: {
          backgroundColor: Colors.brand.darkBlue,
          borderTopColor: Colors.brand.darkGray,
        },
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