// app/year.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';
import {
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
          <ThemedView style={globalStyles.contentContainer}>
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
              onPress={() => alert(`Sign-up complete! Year: ${year}`)}
            >
              <ThemedText style={globalStyles.primaryButtonText}>Confirm</ThemedText>
            </TouchableOpacity>

            <ThemedText style={globalStyles.infoText}>
              Please enter your four-digit year of birth to complete verification.
            </ThemedText>
          </ThemedView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}