import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Search, MessageCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface Connection {
  id: string;
  name: string;
  title: string;
  location: string;
  profilePicture?: string;
}

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: 'c1',
    name: 'Sarah Johnson',
    title: 'Senior Recruiter at Tech Africa',
    location: 'Nairobi, Kenya',
    profilePicture: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'c2',
    name: 'Michael Chen',
    title: 'Product Manager | Innovation Hub',
    location: 'Cape Town, South Africa',
    profilePicture: 'https://i.pravatar.cc/150?img=13',
  },
  {
    id: 'c3',
    name: 'Emma Thompson',
    title: 'UI/UX Designer | Creative Studios',
    location: 'Nairobi, Kenya',
    profilePicture: 'https://i.pravatar.cc/150?img=45',
  },
  {
    id: 'c4',
    name: 'David Martinez',
    title: 'Data Analyst at Analytics Pro',
    location: 'Johannesburg, South Africa',
    profilePicture: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: 'c5',
    name: 'Lisa Anderson',
    title: 'Marketing Manager | Brand Builders',
    location: 'Kigali, Rwanda',
    profilePicture: 'https://i.pravatar.cc/150?img=27',
  },
];

export default function ConnectionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [connections] = useState<Connection[]>(MOCK_CONNECTIONS);

  const filteredConnections = connections.filter((connection) =>
    connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{connections.length} Connections</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color={Colors.textLight} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search connections..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredConnections.map((connection) => (
          <Pressable
            key={connection.id}
            style={styles.connectionCard}
            onPress={() => router.push({ pathname: '/user-profile', params: { userId: connection.id } })}
          >
            <View style={styles.avatar}>
              {connection.profilePicture ? (
                <Image
                  source={{ uri: connection.profilePicture }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{connection.name.charAt(0)}</Text>
                </View>
              )}
            </View>

            <View style={styles.connectionInfo}>
              <Text style={styles.connectionName}>{connection.name}</Text>
              <Text style={styles.connectionTitle} numberOfLines={2}>
                {connection.title}
              </Text>
              <Text style={styles.connectionLocation}>{connection.location}</Text>
            </View>

            <Pressable
              style={styles.messageButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push('/messages');
              }}
            >
              <MessageCircle color={Colors.primary} size={20} />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  connectionTitle: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 4,
  },
  connectionLocation: {
    fontSize: 13,
    color: Colors.textLight,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
