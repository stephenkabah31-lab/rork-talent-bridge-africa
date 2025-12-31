import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Crown, Phone, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface UserData {
  userType: 'professional' | 'recruiter' | 'company';
  fullName?: string;
  companyName?: string;
  email: string;
  isPremium?: boolean;
}

interface Message {
  id: string;
  text: string;
  isFromMe: boolean;
  timestamp: string;
}

export default function MessagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobTitle = params.jobTitle as string;
  const [inputText, setInputText] = useState('');

  const { data: user } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const isRecruiter = user?.userType === 'recruiter' || user?.userType === 'company';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: isRecruiter 
        ? 'Hi! I saw your application and would love to discuss the opportunity.'
        : 'Thank you for your interest. I\'d be happy to discuss the role.',
      isFromMe: isRecruiter,
      timestamp: '10:30 AM',
    },
  ]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    if (!user?.isPremium) {
      Alert.alert(
        'Premium Feature',
        'You need a Premium subscription to send messages to recruiters. Free users can only respond when recruiters reach out first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isFromMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
        {!user?.isPremium && (
          <View style={styles.premiumBanner}>
            <Crown color={Colors.primary} size={20} />
            <Text style={styles.premiumText}>
              Upgrade to Premium to message recruiters
            </Text>
          </View>
        )}

        {jobTitle && (
          <View style={styles.jobContext}>
            <Text style={styles.jobContextLabel}>Regarding:</Text>
            <Text style={styles.jobContextTitle}>{jobTitle}</Text>
          </View>
        )}

        {(user?.userType === 'recruiter' || user?.userType === 'company') && (
          <View style={styles.actionsBar}>
            <Pressable
              style={({ pressed }) => [
                styles.scheduleCallButton,
                pressed && styles.scheduleCallButtonPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/schedule-call' as any,
                  params: {
                    candidateName: params.candidateName || 'Candidate',
                    jobTitle: jobTitle || '',
                  },
                })
              }
            >
              <Calendar color={Colors.primary} size={18} />
              <Text style={styles.scheduleCallText}>Schedule Call</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.viewCallsButton,
                pressed && styles.viewCallsButtonPressed,
              ]}
              onPress={() => router.push('/scheduled-calls' as any)}
            >
              <Phone color={Colors.secondary} size={18} />
              <Text style={styles.viewCallsText}>View Calls</Text>
            </Pressable>
          </View>
        )}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.isFromMe ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.isFromMe ? styles.myMessageText : styles.theirMessageText,
                ]}
              >
                {item.text}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  item.isFromMe ? styles.myTimestamp : styles.theirTimestamp,
                ]}
              >
                {item.timestamp}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, !user?.isPremium && styles.inputDisabled]}
            placeholder={
              user?.isPremium
                ? 'Type a message...'
                : 'Upgrade to Premium to send messages'
            }
            placeholderTextColor={Colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={user?.isPremium}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              (!inputText.trim() || !user?.isPremium) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || !user?.isPremium}
          >
            <Send
              color={inputText.trim() && user?.isPremium ? Colors.white : Colors.textLight}
              size={20}
            />
          </Pressable>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  premiumBanner: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  premiumText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  jobContext: {
    backgroundColor: Colors.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  jobContextLabel: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  jobContextTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: Colors.white,
  },
  theirMessageText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  theirTimestamp: {
    color: Colors.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light,
  },
  sendButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  actionsBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
    gap: 12,
  },
  scheduleCallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  scheduleCallButtonPressed: {
    opacity: 0.7,
  },
  scheduleCallText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  viewCallsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  viewCallsButtonPressed: {
    opacity: 0.7,
  },
  viewCallsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
});
