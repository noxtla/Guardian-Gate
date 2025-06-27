// app/(tabs)/notifications.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { StyleSheet } from 'react-native';

export default function NotificationsScreen() {
  return (
    <ThemedView style={[globalStyles.darkScreenContainer, styles.container]}>
      <ThemedText type="title">Notifications</ThemedText>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});