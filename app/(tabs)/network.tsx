import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { UserPlus, UserCheck, Search, Users, Briefcase } from 'lucide-react-native';
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

interface Person {
  id: string;
  name: string;
  title: string;
  location: string;
  connections: number;
  isConnected: boolean;
  isPending?: boolean;
  profilePicture?: string;
}

const MOCK_SUGGESTIONS: Person[] = [
  {
    id: 'p1',
    name: 'Kwame Mensah',
    title: 'Software Engineer at Andela',
    location: 'Accra, Ghana',
    connections: 342,
    isConnected: false,
    profilePicture: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'p2',
    name: 'Amara Okafor',
    title: 'Product Designer | Startups',
    location: 'Lagos, Nigeria',
    connections: 589,
    isConnected: false,
    profilePicture: 'https://i.pravatar.cc/150?img=45',
  },
  {
    id: 'p3',
    name: 'Tendai Moyo',
    title: 'Data Scientist at IBM',
    location: 'Johannesburg, South Africa',
    connections: 721,
    isConnected: false,
    profilePicture: 'https://i.pravatar.cc/150?img=33',
  },
];

const MOCK_CONNECTIONS: Person[] = [
  {
    id: 'c1',
    name: 'Sarah Johnson',
    title: 'Senior Recruiter at Tech Africa',
    location: 'Nairobi, Kenya',
    connections: 1243,
    isConnected: true,
    profilePicture: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'c2',
    name: 'Michael Chen',
    title: 'Product Manager | Innovation Hub',
    location: 'Cape Town, South Africa',
    connections: 867,
    isConnected: true,
    profilePicture: 'https://i.pravatar.cc/150?img=13',
  },
];

export default function NetworkScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Person[]>(MOCK_SUGGESTIONS);

  useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const handleConnect = (personId: string) => {
    setSuggestions((prev) =>
      prev.map((person) =>
        person.id === personId ? { ...person, isPending: true } : person
      )
    );
  };

  const renderPerson = ({ item }: { item: Person }) => (
    <Pressable
      style={styles.personCard}
      onPress={() => router.push(`/user-profile?userId=${item.id}` as any)}
    >
      <View style={styles.personHeader}>
        <View style={styles.avatar}>
          {item.profilePicture ? (
            <Image source={{ uri: item.profilePicture }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{item.name}</Text>
          <Text style={styles.personTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.personLocation}>{item.location}</Text>
          <Text style={styles.connectionCount}>{item.connections} connections</Text>
        </View>
      </View>

      {!item.isConnected && (
        <Pressable
          style={({ pressed }) => [
            styles.connectButton,
            item.isPending && styles.connectButtonPending,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleConnect(item.id)}
          disabled={item.isPending}
        >
          {item.isPending ? (
            <>
              <UserCheck color={Colors.textLight} size={18} />
              <Text style={styles.connectButtonTextPending}>Pending</Text>
            </>
          ) : (
            <>
              <UserPlus color={Colors.white} size={18} />
              <Text style={styles.connectButtonText}>Connect</Text>
            </>
          )}
        </Pressable>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Network</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search color={Colors.textLight} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.statsCard}>
          <Pressable
            style={styles.statItem}
            onPress={() => router.push('/connections')}
          >
            <Users color={Colors.primary} size={28} />
            <Text style={styles.statNumber}>{MOCK_CONNECTIONS.length}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </Pressable>

          <View style={styles.statDivider} />

          <Pressable
            style={styles.statItem}
            onPress={() => router.push('/people-search' as any)}
          >
            <Search color={Colors.secondary} size={28} />
            <Text style={styles.statNumber}>Find</Text>
            <Text style={styles.statLabel}>New People</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People you may know</Text>
            <Pressable onPress={() => router.push('/people-search' as any)}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          {suggestions.map((person) => (
            <View key={person.id}>{renderPerson({ item: person })}</View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent connections</Text>
            <Pressable onPress={() => router.push('/connections')}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>

          {MOCK_CONNECTIONS.slice(0, 3).map((person) => (
            <Pressable
              key={person.id}
              style={styles.connectionItem}
              onPress={() => router.push(`/user-profile?userId=${person.id}` as any)}
            >
              <View style={styles.connectionAvatar}>
                {person.profilePicture ? (
                  <Image source={{ uri: person.profilePicture }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{person.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>{person.name}</Text>
                <Text style={styles.connectionTitle} numberOfLines={1}>
                  {person.title}
                </Text>
              </View>
              <Briefcase color={Colors.textLight} size={20} />
            </Pressable>
          ))}
        </View>
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
  scrollView: {
    flex: 1,
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
  statsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textLight,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  personCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  personHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  personInfo: {
    flex: 1,
    gap: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  personTitle: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 18,
  },
  personLocation: {
    fontSize: 13,
    color: Colors.textLight,
  },
  connectionCount: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  connectButtonPending: {
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  connectButtonTextPending: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textLight,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  connectionTitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
});
