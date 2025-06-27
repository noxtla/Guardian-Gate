// app/ssn.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

export default function SsnScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [ssn, setSsn] = useState('');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.brand.darkBlue }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ThemedView style={[styles.container, { backgroundColor: Colors.brand.darkBlue }]}>
            <ThemedText style={styles.header}>Enter your SSN</ThemedText>

            <IconSymbol name="shield.fill" size={150} color={Colors.brand.lightBlue} />

            <TextInput
              style={styles.input}
              placeholder="SSN"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={ssn}
              onChangeText={setSsn}
              maxLength={9}
            />

            <TouchableOpacity style={styles.button} onPress={() => router.push('/dob')}>
              <ThemedText style={styles.buttonText}>Continue</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.footerText}>
              For currently active employees only.{'\n'}Any fraudulent activity will be penalized.
            </ThemedText>
          </ThemedView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.brand.white,
    marginTop: 20,
  },
  input: {
    backgroundColor: Colors.brand.white,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    color: Colors.brand.darkGray,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: Colors.brand.lightBlue,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: Colors.brand.white,
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: Colors.brand.gray,
    textAlign: 'center',
    marginBottom: 10,
  },
});