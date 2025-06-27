// app/(tabs)/profile.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <ThemedView style={[globalStyles.darkScreenContainer, styles.container]}>
      <ThemedText type="title">Profile</ThemedText>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});