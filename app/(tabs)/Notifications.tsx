// app/(tabs)/Notifications.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface Notification {
  id: string;
  userName: string;
  userAvatarSource?: ImageSourcePropType;
  systemIcon?: IconSymbolName;
  metadata: string;
  content: string;
  isRead: boolean;
}

const DEFAULT_USER_AVATAR: ImageSourcePropType = require('@/assets/images/adaptive-icon.png');

const NotificationItem = ({ notification }: { notification: Notification }) => {
  return (
    <View style={globalStyles.notificationItem}>
      <View style={globalStyles.notificationAvatarContainer}>
        {notification.systemIcon ? (
          <IconSymbol name={notification.systemIcon} size={28} color={Colors.brand.darkBlue} style={globalStyles.notificationBotIcon} />
        ) : (
          <Image source={notification.userAvatarSource || DEFAULT_USER_AVATAR} style={globalStyles.notificationUserAvatar} />
        )}
      </View>
      <View style={globalStyles.notificationContentWrapper}>
        <ThemedText style={globalStyles.notificationTitle}>{notification.userName}</ThemedText>
        <ThemedText style={globalStyles.notificationMetadata}>{notification.metadata}</ThemedText>
        <ThemedText style={globalStyles.notificationContent}>{notification.content}</ThemedText>
      </View>
      <View style={notification.isRead ? globalStyles.notificationReadDot : globalStyles.notificationUnreadDot} />
    </View>
  );
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notificationList] = useState<Notification[]>([
    { id: '1', userName: 'SystemTreeService', systemIcon: 'rectangle.fill.on.rectangle.fill', metadata: 'Asistencia Registrada Exitosamente • 3d', content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!', isRead: false },
    { id: '2', userName: 'SystemTreeService', systemIcon: 'rectangle.fill.on.rectangle.fill', metadata: 'Asistencia Registrada Exitosamente • 5d', content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!', isRead: false },
    { id: '3', userName: 'SystemTreeService', systemIcon: 'rectangle.fill.on.rectangle.fill', metadata: 'Asistencia Registrada Exitosamente • 6d', content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!', isRead: true },
  ]);

  const newNotifications = notificationList.filter((n) => !n.isRead);
  const readNotifications = notificationList.filter((n) => n.isRead);

  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="arrow.backward" size={24} color={Colors.brand.darkBlue} />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
      <View style={styles.spacer} />
    </View>
  );

  return (
    <ThemedView style={globalStyles.lightScreenContainer}>
      {renderHeader()}
      {notificationList.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <ThemedText style={globalStyles.infoText}>You have no notifications.</ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContentContainer} showsVerticalScrollIndicator={false}>
          {newNotifications.length > 0 && (
            <View>
              <ThemedText style={globalStyles.notificationSectionHeader}>New</ThemedText>
              {newNotifications.map((n) => <NotificationItem key={n.id} notification={n} />)}
            </View>
          )}
          {readNotifications.length > 0 && (
            <View>
              <ThemedText style={globalStyles.notificationSectionHeader}>Read</ThemedText>
              {readNotifications.map((n) => <NotificationItem key={n.id} notification={n} />)}
            </View>
          )}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: Colors.brand.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.brand.lightGray,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.brand.darkBlue, fontFamily: 'OpenSans-SemiBold', flex: 1, textAlign: 'center', marginRight: -34 },
  spacer: { width: 34 },
  listContentContainer: { paddingBottom: 20 },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
});