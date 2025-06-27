// app/(tabs)/index.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={[globalStyles.darkScreenContainer, styles.container]}>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          <ThemedText style={styles.menuButtonText}>Attendance</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          <ThemedText style={styles.menuButtonText}>Vehicles</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          <ThemedText style={styles.menuButtonText}>Job Briefing</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          <ThemedText style={styles.menuButtonText}>Safety</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  menuContainer: {
    width: '100%',
    gap: 20, // Espacio entre los botones
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Un fondo semi-transparente
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.darkGray,
  },
  menuButtonText: {
    color: Colors.brand.white,
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
});