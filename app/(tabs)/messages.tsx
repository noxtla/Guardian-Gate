// app/(tabs)/messages.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
StyleSheet,
View,
TouchableOpacity,
TextInput,
FlatList,
KeyboardAvoidingView,
Platform,
Keyboard,
Image,
ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// --- DATA & TYPE DEFINITIONS (No Changes) ---
interface Message {
id: string;
text: string;
time: string;
isSender: boolean;
avatarSource: ImageSourcePropType;
}
const AVATARS = {
user: require('@/assets/images/adaptive-icon.png'),
support: require('@/assets/images/adaptive-icon.png'),
};
const initialMessages: Message[] = [
{
id: '1',
text: "Hello! I'm having an issue with my vehicle's brakes. Can you help?",
time: '10:47 PM',
isSender: true,
avatarSource: AVATARS.user,
},
{
id: '2',
text: 'Hello! I can certainly help with that. Could you please provide the vehicle number?',
time: '10:48 PM',
isSender: false,
avatarSource: AVATARS.support,
},
];

// --- CHILD COMPONENTS (No Changes) ---
const MessageBubble = React.memo(({ message }: { message: Message }) => {
const bubbleStyles = message.isSender ? styles.senderBubble : styles.receiverBubble;
const textStyles = message.isSender ? styles.senderText : styles.receiverText;
const timeStyles = message.isSender ? styles.senderTime : styles.receiverTime;
return (
<View style={[styles.messageRow, message.isSender ? styles.messageRowSender : styles.messageRowReceiver]}>
{!message.isSender && <View style={styles.avatarContainer}><Image source={message.avatarSource} style={styles.avatar} /></View>}
<View style={[styles.bubbleContainer, bubbleStyles]}><ThemedText style={textStyles}>{message.text}</ThemedText><ThemedText style={timeStyles}>{message.time}</ThemedText></View>
{message.isSender && <View style={styles.avatarContainer}><Image source={message.avatarSource} style={styles.avatar} /></View>}
</View>
);
});

// --- MAIN SCREEN COMPONENT ---
export default function MessagesScreen() {
const insets = useSafeAreaInsets();
const [inputText, setInputText] = useState('');
const [messages, setMessages] = useState<Message[]>(initialMessages);
const flatListRef = useRef<FlatList>(null);

const isSendButtonActive = useMemo(() => inputText.trim().length > 0, [inputText]);

useEffect(() => {
const timer = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
return () => clearTimeout(timer);
}, [messages]);

const handleSend = useCallback(() => {
if (!isSendButtonActive) return;
const userMessage: Message = { id: String(Date.now()), text: inputText.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), isSender: true, avatarSource: AVATARS.user };
setMessages((prevMessages) => [...prevMessages, userMessage]);
setInputText('');
Keyboard.dismiss();
setTimeout(() => {
const supportReply: Message = { id: String(Date.now() + 1), text: 'Thank you for your message. An agent will be with you shortly.', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), isSender: false, avatarSource: AVATARS.support };
setMessages((prevMessages) => [...prevMessages, supportReply]);
}, 1500);
}, [inputText, isSendButtonActive]);

// Header height needs to be accounted for in keyboardVerticalOffset on iOS
const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 80;

const renderHeader = () => (
<View style={[styles.headerContainer, { height: HEADER_HEIGHT, paddingTop: insets.top }]}>
<TouchableOpacity onPress={() => router.back()} style={styles.backButton}><IconSymbol name="arrow.backward" size={24} color={Colors.brand.darkBlue} /></TouchableOpacity>
<ThemedText style={styles.headerTitle}>Support Chat</ThemedText>
<View style={{ width: 34 }} />
</View>
);

return (
<ThemedView style={styles.container}>
{renderHeader()}
<KeyboardAvoidingView
style={styles.keyboardAvoidingContainer}
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
// This offset tells iOS to not push content up for the header, which is already visible
keyboardVerticalOffset={HEADER_HEIGHT}
>
<FlatList
ref={flatListRef}
data={messages}
renderItem={({ item }) => <MessageBubble message={item} />}
keyExtractor={(item) => item.id}
contentContainerStyle={styles.messageListContent}
onScrollBeginDrag={Keyboard.dismiss}
/>
<View style={[styles.inputAreaContainer, { paddingBottom: insets.bottom === 0 ? 10 : insets.bottom }]}>
<TouchableOpacity style={styles.attachmentButton}><IconSymbol name="paperclip.fill" size={24} color={Colors.brand.gray} /></TouchableOpacity>
<TextInput
style={styles.messageInput}
placeholder="Type a message..."
placeholderTextColor={Colors.brand.gray}
value={inputText}
onChangeText={setInputText}
multiline
onSubmitEditing={handleSend}
/>
<TouchableOpacity
style={[styles.sendButton, isSendButtonActive ? styles.sendButtonActive : styles.sendButtonInactive]}
onPress={handleSend}
disabled={!isSendButtonActive}
>
<IconSymbol name="paperplane.fill" size={24} color={Colors.brand.white} />
</TouchableOpacity>
</View>
</KeyboardAvoidingView>
</ThemedView>
);
}

// --- STYLES ---
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: Colors.brand.lightGray,
},
keyboardAvoidingContainer: {
flex: 1,
// *** THE FIX IS HERE ***
// We use marginBottom to create a physical space at the bottom for the tab bar.
// This is better than padding because it doesn't interfere with the KeyboardAvoidingView's calculations.
marginBottom: 80,
},
headerContainer: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingHorizontal: 15,
backgroundColor: Colors.brand.white,
borderBottomWidth: StyleSheet.hairlineWidth,
borderBottomColor: Colors.brand.lightGray,
},
backButton: { padding: 5 },
headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.brand.darkBlue, fontFamily: 'OpenSans-SemiBold' },
messageListContent: { paddingHorizontal: 15, paddingTop: 10, flexGrow: 1, justifyContent: 'flex-end' },
messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 },
messageRowSender: { justifyContent: 'flex-end' },
messageRowReceiver: { justifyContent: 'flex-start' },
avatarContainer: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8 },
avatar: { width: '100%', height: '100%' },
bubbleContainer: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, maxWidth: '75%' },
senderBubble: { backgroundColor: Colors.brand.darkBlue, borderBottomRightRadius: 5 },
receiverBubble: { backgroundColor: Colors.brand.white, borderBottomLeftRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
senderText: { color: Colors.brand.white, fontSize: 16, fontFamily: 'OpenSans-Regular' },
receiverText: { color: Colors.brand.darkBlue, fontSize: 16, fontFamily: 'OpenSans-Regular' },
senderTime: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, textAlign: 'right', marginTop: 4 },
receiverTime: { color: Colors.brand.gray, fontSize: 12, textAlign: 'right', marginTop: 4 },
inputAreaContainer: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: Colors.brand.white,
paddingTop: 10,
paddingHorizontal: 15,
borderTopWidth: StyleSheet.hairlineWidth,
borderColor: Colors.brand.lightGray,
},
attachmentButton: { padding: 8 },
messageInput: { flex: 1, backgroundColor: Colors.brand.lightGray, borderRadius: 20, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: 16, marginHorizontal: 10, color: Colors.brand.darkBlue, maxHeight: 100, fontFamily: 'OpenSans-Regular' },
sendButton: { borderRadius: 24, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
sendButtonActive: { backgroundColor: Colors.brand.lightBlue },
sendButtonInactive: { backgroundColor: Colors.brand.gray },
});