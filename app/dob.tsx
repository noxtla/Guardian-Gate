// app/dob.tsx

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  View,
  TextInput,
} from 'react-native';

export default function DobScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors.brand.darkBlue} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.title}>Date of Birth</ThemedText>
          <ThemedText style={styles.subtitle}>
            Please enter your date of birth to continue.
          </ThemedText>

          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            maxLength={10} // MM/DD/YYYY
            placeholder="MM/DD/YYYY"
            placeholderTextColor={Colors.brand.gray}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => alert('Authentication logic goes here!')}>
          <ThemedText style={styles.buttonText}>Verify and Enter</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.white,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brand.darkBlue,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.brand.darkGray,
    marginBottom: 40,
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderColor: Colors.brand.lightGray,
    width: '100%',
    color: Colors.brand.darkBlue,
    paddingBottom: 10,
  },
  button: {
    backgroundColor: Colors.brand.lightBlue,
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.brand.white,
    fontSize: 18,
    fontWeight: '600',
  },
});