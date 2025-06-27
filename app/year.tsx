// app/year.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

export default function YearScreen() {
  const [year, setYear] = useState('');
  const isYearValid = year.length === 4;

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[globalStyles.contentContainer, styles.container]}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>4/4</Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '100%' }]} />
              </View>
            </View>

            <IconSymbol name="paperplane.fill" size={150} color={Colors.brand.lightBlue} />

            <TextInput
              style={globalStyles.textInput}
              placeholder="YYYY"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={year}
              onChangeText={setYear}
              maxLength={4}
            />

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                !isYearValid && globalStyles.disabledButton,
              ]}
              disabled={!isYearValid}
              onPress={() => router.push('/biometric')}
            >
              <ThemedText style={globalStyles.primaryButtonText}>Confirm</ThemedText>
            </TouchableOpacity>

            <ThemedText style={globalStyles.infoText}>
              Please enter your four-digit year of birth to complete verification.
            </ThemedText>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
    },
    progressContainer: {
        width: '100%',
        marginBottom: 24,
    },
    progressText: {
        alignSelf: 'flex-end',
        color: Colors.brand.gray,
        fontSize: 14,
        marginBottom: 8,
    },
    progressBarBackground: {
        height: 8,
        width: '100%',
        backgroundColor: Colors.brand.darkGray,
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.brand.lightBlue,
        borderRadius: 4,
    },
});