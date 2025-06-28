// app/(tabs)/messages.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ⚠️ IMPORTANT: Placeholder images needed in assets/images/ for avatars
// Ensure these files exist in assets/images/:
// assets/images/avatar-carlos.png
// assets/images/avatar-default.png

// Interface for a single message object
interface Message {
  id: string;
  text: string;
  time: string;
  isSender: boolean; // true if the message is from the current user, false if from other participant
  avatar: 'carlos' | 'default'; // Type for avatar source identifier
}

// Mapeo genérico de avatares
type AvatarName = 'carlos' | 'default'; // Define los nombres de los avatares permitidos
const AVATAR_SOURCES: Record<AvatarName, ImageSourcePropType> = {
  carlos: require('@/assets/images/adaptive-icon.png'), // Using adaptive-icon as placeholder
  default: require('@/assets/images/adaptive-icon.png'), // Using adaptive-icon as placeholder
};

// Component for a single chat message bubble
const MessageBubble = ({ message }: { message: Message }) => {
  const bubbleStyles = message.isSender ? styles.senderBubble : styles.receiverBubble;
  const textStyles = message.isSender ? styles.senderText : styles.receiverText;
  const timeStyles = message.isSender ? styles.senderTime : styles.receiverTime;
  
  const avatarSource = AVATAR_SOURCES[message.avatar];

  return (
    <View style={[styles.messageRow, message.isSender ? styles.messageRowSender : styles.messageRowReceiver]}>
      {/* Render avatar on the left for receiver messages */}
      {!message.isSender && (
        <View style={styles.avatarContainer}>
          <Image source={avatarSource} style={styles.avatar} />
        </View>
      )}
      {/* Message bubble content */}
      <View style={[styles.bubbleContainer, bubbleStyles]}>
        <ThemedText style={textStyles}>{message.text}</ThemedText>
        <ThemedText style={timeStyles}>{message.time}</ThemedText>
      </View>
      {/* Render avatar on the right for sender messages */}
      {message.isSender && (
        <View style={styles.avatarContainer}>
          <Image source={avatarSource} style={styles.avatar} />
        </View>
      )}
    </View>
  );
};

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I'm having an issue with my vehicle's brakes. Can you help?", time: '10:47 PM', isSender: true, avatar: 'default' },
    { id: '2', text: "Hello Carlos! I can certainly help with that. Could you please provide the vehicle number?", time: '10:48 PM', isSender: false, avatar: 'carlos' },
    { id: '3', text: "Yes, the truck number is 451-9876.", time: '10:49 PM', isSender: true, avatar: 'default' },
    { id: '4', text: "Thank you. I see that truck 451-9876 is due for maintenance. I am scheduling a priority inspection for you now. Is there anything else I can assist with?", time: '10:51 PM', isSender: false, avatar: 'carlos' },
  ]);
  const flatListRef = useRef<FlatList>(null);

  // Determine if the send button should be active
  const isSendButtonActive = useMemo(() => inputText.trim().length > 0, [inputText]);

  useEffect(() => {
    // Scroll to end when messages change or component mounts
    // Using a timeout to ensure layout is updated before scrolling
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100); // Small delay
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = () => {
    if (isSendButtonActive) {
      const newMessage: Message = {
        id: String(messages.length + 1),
        text: inputText.trim(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isSender: true,
        avatar: 'default', // Default avatar for the sender
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText('');
    }
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="arrow.backward" size={24} color={Colors.brand.darkBlue} />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>Support Chat</ThemedText>
    </View>
  );

  return (
    <ThemedView style={globalStyles.lightScreenContainer}>
      {renderHeader()}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 50 : 0} 
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={styles.messageListWrapper}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => <MessageBubble message={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageListContent}
            style={styles.messageListContainer} // Make FlatList component flex: 1
          />
        </TouchableWithoutFeedback>

        <View style={styles.inputAreaContainer}>
          <TouchableOpacity style={styles.attachmentButton}>
            <IconSymbol name="paperclip.fill" size={24} color={Colors.brand.gray} />
          </TouchableOpacity>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.brand.gray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            blurOnSubmit={false} // Prevents keyboard dismissal on "submit" (Enter)
            onSubmitEditing={handleSend} // Allows sending on Enter key press
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              isSendButtonActive ? styles.sendButtonActive : styles.sendButtonInactive,
            ]}
            onPress={handleSend}
            disabled={!isSendButtonActive} // Disable when input is empty
          >
            <IconSymbol name="paperplane.fill" size={24} color={Colors.brand.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1, // Ensures KAV takes full height
    justifyContent: 'flex-end', // Pushes content to the bottom
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: Colors.brand.lightGray,
    height: Platform.OS === 'ios' ? 100 : 80,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.brand.darkBlue,
    fontFamily: 'OpenSans-SemiBold',
  },
  // New styles for FlatList and its wrapper
  messageListWrapper: {
    flex: 1, // Make TouchableWithoutFeedback fill available space
  },
  messageListContainer: { // Style for the FlatList component itself
    flex: 1, // Crucial: make FlatList fill available space
  },
  messageListContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexGrow: 1, // Allows content to grow within the scroll view
    justifyContent: 'flex-end', // Aligns messages to the bottom of the visible area
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    maxWidth: '100%',
  },
  messageRowSender: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageRowReceiver: {
    alignSelf: 'flex-start',
  },
  bubbleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    maxWidth: '80%',
    flexShrink: 1,
  },
  senderBubble: {
    backgroundColor: Colors.brand.darkBlue,
    borderBottomRightRadius: 5,
    marginRight: 8,
  },
  receiverBubble: {
    backgroundColor: Colors.brand.white,
    borderBottomLeftRadius: 5,
    marginLeft: 8,
  },
  senderText: {
    color: Colors.brand.white,
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'OpenSans-Regular',
  },
  receiverText: {
    color: Colors.brand.darkBlue,
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'OpenSans-Regular',
  },
  senderTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'right',
    fontFamily: 'OpenSans-Regular',
  },
  receiverTime: {
    color: Colors.brand.gray,
    fontSize: 12,
    textAlign: 'right',
    fontFamily: 'OpenSans-Regular',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  inputAreaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  attachmentButton: {
    padding: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.brand.lightGray,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginHorizontal: 10,
    color: Colors.brand.darkBlue,
    maxHeight: 100, // Limits height of multiline input
    fontFamily: 'OpenSans-Regular',
  },
  sendButton: {
    borderRadius: 25,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  sendButtonActive: {
    backgroundColor: Colors.brand.lightBlue, // Active state color
  },
  sendButtonInactive: {
    backgroundColor: Colors.brand.darkGray, // Inactive/disabled state color
    opacity: 0.6, // Visual feedback for disabled
  },
});