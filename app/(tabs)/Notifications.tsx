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
  FlatList,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ⚠️ IMPORTANT: Placeholder images needed in assets/images/ for avatars
// Ensure these files exist in assets/images/:
// assets/images/avatar-default.png (or use adaptive-icon.png for a generic look)

interface Notification {
  id: string;
  userName: string;
  userAvatarSource?: ImageSourcePropType; // Optional for user avatars
  systemIcon?: IconSymbolName; // Optional for system notifications
  metadata: string;
  content: string;
  isRead: boolean;
}

// Mapeo para avatares predeterminados, usando adaptive-icon.png como placeholder
const DEFAULT_USER_AVATAR: ImageSourcePropType = require('@/assets/images/adaptive-icon.png');

// Componente para un ítem de notificación individual
const NotificationItem = ({ notification }: { notification: Notification }) => {
  return (
    <View style={globalStyles.notificationItem}>
      {/* Avatar / Icon */}
      <View style={globalStyles.notificationAvatarContainer}>
        {notification.systemIcon ? (
          <IconSymbol
            name={notification.systemIcon}
            size={28} // Adjusted size to match image more closely
            color={Colors.brand.darkBlue}
            style={globalStyles.notificationBotIcon}
          />
        ) : (
          <Image
            source={notification.userAvatarSource || DEFAULT_USER_AVATAR}
            style={globalStyles.notificationUserAvatar}
          />
        )}
      </View>

      {/* Content */}
      <View style={globalStyles.notificationContentWrapper}>
        <ThemedText style={globalStyles.notificationTitle}>
          {notification.userName}
        </ThemedText>
        <ThemedText style={globalStyles.notificationMetadata}>
          {notification.metadata}
        </ThemedText>
        <ThemedText style={globalStyles.notificationContent}>
          {notification.content}
        </ThemedText>
      </View>

      {/* Read/Unread Dot */}
      <View
        style={
          notification.isRead
            ? globalStyles.notificationReadDot
            : globalStyles.notificationUnreadDot
        }
      />
    </View>
  );
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  // Mock data for notifications
  const [notificationList] = useState<Notification[]>([
    {
      id: '1',
      userName: 'SystemTreeService',
      systemIcon: 'rectangle.fill.on.rectangle.fill',
      metadata: 'Asistencia Registrada Exitosamente • 3d',
      content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!',
      isRead: false,
    },
    {
      id: '2',
      userName: 'SystemTreeService',
      systemIcon: 'rectangle.fill.on.rectangle.fill',
      metadata: 'Asistencia Registrada Exitosamente • 5d',
      content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!',
      isRead: false,
    },
    {
      id: '3',
      userName: 'SystemTreeService',
      systemIcon: 'rectangle.fill.on.rectangle.fill',
      metadata: 'Asistencia Registrada Exitosamente • 6d',
      content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!',
      isRead: false,
    },
    {
      id: '4',
      userName: 'SystemTreeService',
      systemIcon: 'rectangle.fill.on.rectangle.fill',
      metadata: 'Asistencia Registrada Exitosamente • 1sem',
      content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!',
      isRead: true, // Example of a read notification
    },
    {
      id: '5',
      userName: 'SystemTreeService',
      systemIcon: 'rectangle.fill.on.rectangle.fill',
      metadata: 'Asistencia Registrada Exitosamente • 1sem',
      content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!',
      isRead: true,
    },
    {
      id: '6',
      userName: 'SystemTreeService',
      systemIcon: 'rectangle.fill.on.rectangle.fill',
      metadata: 'Asistencia Registrada Exitosamente • 1sem',
      content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!',
      isRead: true,
    },
    {
      id: '7',
      userName: 'SystemTreeService',
      systemIcon: 'rectangle.fill.on.rectangle.fill',
      metadata: 'Asistencia Registrada Exitosamente • 1sem',
      content: 'Tu check-in del día ha sido registrado. ¡Que tengas un excelente día!',
      isRead: true,
    },
  ]);

  const newNotifications = notificationList.filter((notification) => !notification.isRead);
  const readNotifications = notificationList.filter((notification) => notification.isRead);

  // Custom header renderer
  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="arrow.backward" size={24} color={Colors.brand.darkBlue} />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
      <View style={styles.spacer} /> {/* Spacer to help center the title */}
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
        <FlatList
          data={[]} // Use empty data as we're rendering sections manually below
          ListHeaderComponent={
            <>
              {newNotifications.length > 0 && (
                <View>
                  <ThemedText style={globalStyles.notificationSectionHeader}>New</ThemedText>
                  {newNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </View>
              )}

              {readNotifications.length > 0 && (
                <View>
                  <ThemedText style={globalStyles.notificationSectionHeader}>Read</ThemedText>
                  {readNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </View>
              )}
            </>
          }
          renderItem={() => null} // No items to render directly from data
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
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
    backgroundColor: Colors.brand.lightGray,
    height: Platform.OS === 'ios' ? 100 : 80, // Adjust height for safe area on iOS
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.brand.lightGray,
  },
  backButton: {
    padding: 5,
    // No marginRight as spacer handles alignment
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.brand.darkBlue,
    fontFamily: 'OpenSans-SemiBold',
    flex: 1, // Allows title to take available space and center
    textAlign: 'center',
    marginRight: -34, // Compensate for backButton padding to truly center (24 icon + 5 padding)
  },
  spacer: {
    width: 34, // Match back button width + padding for centering effect
  },
  listContentContainer: {
    paddingBottom: 20, // Add some padding at the bottom for scroll
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});