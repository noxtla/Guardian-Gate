// app/dob.tsx

import { ThemedText } from '@/components/ThemedText';
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
// --- CAMBIO CLAVE: Importar estilos globales ---
import { globalStyles } from '@/constants/AppStyles';

export default function DobScreen() {
  return (
    <SafeAreaView style={globalStyles.lightScreenContainer}>
      <View style={styles.container}>
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

        <TouchableOpacity
          style={globalStyles.primaryButton} // Usar estilo global
          onPress={() => alert('Authentication logic goes here!')}>
          <ThemedText style={globalStyles.primaryButtonText}>
            Verify and Enter
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
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
    lineHeight: 40,
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
});