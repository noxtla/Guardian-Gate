// app/(tabs)/index.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';

interface MenuItemData {
  key: string;
  title: string;
  icon: IconSymbolName;
}

const menuItems: MenuItemData[] = [
  { key: '1', title: 'Attendance', icon: 'person.badge.clock.fill' },
  { key: '2', title: 'Vehicles', icon: 'car.fill' },
  { key: '3', title: 'Job Briefing', icon: 'list.bullet.clipboard.fill' },
  { key: '4', title: 'Safety', icon: 'heart.shield.fill' },
  { key: '5', title: 'Work', icon: 'wrench.and.screwdriver.fill' },
  { key: '6', title: 'Ticket', icon: 'exclamationmark.bubble.fill' },
];

const MenuItem = ({ item }: { item: MenuItemData }) => (
  <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
    <IconSymbol name={item.icon} size={48} color={Colors.brand.darkBlue} />
    <ThemedText style={styles.menuButtonText}>{item.title}</ThemedText>
  </TouchableOpacity>
);

export default function HomeScreen() {
  return (
    <ThemedView style={[globalStyles.lightScreenContainer, styles.container]}>
      <FlatList
        data={menuItems}
        renderItem={({ item }) => <MenuItem item={item} />}
        keyExtractor={item => item.key}
        numColumns={2}
        contentContainerStyle={styles.menuContainer}
        scrollEnabled={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    backgroundColor: Colors.brand.lightGray,
  },
  menuContainer: {
    justifyContent: 'center',
  },
  menuButton: {
    backgroundColor: Colors.brand.white,
    flex: 1,
    margin: 10,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonText: {
    color: Colors.brand.darkBlue,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
});