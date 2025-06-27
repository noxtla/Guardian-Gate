// app/(tabs)/messages.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { StyleSheet } from 'react-native';

export default function MessagesScreen() {
  return (
    <ThemedView style={[globalStyles.darkScreenContainer, styles.container]}>
      <ThemedText type="title">Messages</ThemedText>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});