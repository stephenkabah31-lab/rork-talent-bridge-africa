
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  jobTitle?: string;
  isReceived: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Amara Okafor',
    lastMessage: 'Hi! I saw your application and would love to discuss the opportunity.',
    timestamp: '10:30 AM',
    unread: 2,
    jobTitle: 'Senior Software Engineer',
    isReceived: true,
  },
  {
    id: '2',
    name: 'Kwame Mensah',
    lastMessage: 'Thank you for your interest in the position.',
    timestamp: 'Yesterday',
    unread: 0,
    jobTitle: 'Product Manager',
    isReceived: true,
  },
  {
    id: '3',
    name: 'Zainab Hassan',
    lastMessage: 'Can we schedule a call for next week?',
    timestamp: '2 days ago',
    unread: 1,
    jobTitle: 'UI/UX Designer',
    isReceived: true,
  },
  {
    id: '4',
    name: 'AfriTech Solutions',
    lastMessage: 'We received your application and will review it shortly.',
    timestamp: '3 days ago',
    unread: 0,
    jobTitle: 'Multiple Positions',
    isReceived: false,
  },
];

type MessageFilter = 'all' | 'received' | 'sent';

export default function MessagesTabScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<MessageFilter>('all');

  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'received' && conv.isReceived) || 
      (filter === 'sent' && !conv.isReceived);
    return matchesSearch && matchesFilter;
  });

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Pressable
      style={({ pressed }) => [
        styles.conversationItem,
        pressed && styles.conversationPressed,
      ]}
      onPress={() => {
        console.log('Opening conversation with:', item.name);
        router.push({
          pathname: '/messages' as any,
          params: {
            candidateName: item.name,
            jobTitle: item.jobTitle || '',
          },
        });
      }}
    >
      <View style={styles.avatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{item.name}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        {item.jobTitle && (
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.jobTitle}
          </Text>
        )}
        <View style={styles.messagePreview}>
          <Text
            style={[
              styles.lastMessage,
              item.unread > 0 && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterButton, filter === 'received' && styles.filterButtonActive]}
          onPress={() => setFilter('received')}
        >
          <Text style={[styles.filterText, filter === 'received' && styles.filterTextActive]}>
            Received
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterButton, filter === 'sent' && styles.filterButtonActive]}
          onPress={() => setFilter('sent')}
        >
          <Text style={[styles.filterText, filter === 'sent' && styles.filterTextActive]}>
            Sent
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Search color={Colors.textLight} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <MessageCircle color={Colors.textLight} size={64} />
          <Text style={styles.emptyTitle}>No Messages</Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'No conversations match your search'
              : 'Start connecting with professionals and recruiters to begin messaging'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  conversationPressed: {
    backgroundColor: '#E5E7EB',
    opacity: 0.8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  jobTitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.textLight,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: Colors.text,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
});
