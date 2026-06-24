import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Search, UserPlus, UserCheck, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function PeopleSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingConnections, setPendingConnections] = useState<Set<string>>(new Set());

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const { data: people = [], isLoading } = trpc.users.search.useQuery(
    { query: searchQuery || '' },
    { enabled: true },
  );

  const connectMutation = trpc.users.connect.useMutation({
    onSuccess: (_data: any, variables: { targetUserId: string }) => {
      setPendingConnections(prev => new Set([...prev, variables.targetUserId]));
    },
  });

  const handleConnect = (personId: string) => {
    if (user) connectMutation.mutate({ userId: user.id, targetUserId: personId });
  };

  const filteredPeople = people;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search color={Colors.textLight} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people by name, title, or location..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsText}>
          {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'} found
        </Text>

        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          filteredPeople.map((person: any) => (
          <Pressable
            key={person.id}
            style={styles.personCard}
            onPress={() => router.push({ pathname: '/user-profile', params: { userId: person.id } })}
          >
            <View style={styles.avatar}>
              {person.profilePicture ? (
                <Image
                  source={{ uri: person.profilePicture }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{(person.name || person.fullName || '?').charAt(0)}</Text>
                </View>
              )}
            </View>

            <View style={styles.personInfo}>
              <Text style={styles.personName}>{person.fullName || person.name}</Text>
              <Text style={styles.personTitle} numberOfLines={2}>
                {person.bio || person.type || ''}
              </Text>
              <View style={styles.locationRow}>
                <MapPin color={Colors.textLight} size={14} />
                <Text style={styles.personLocation}>{person.country || ''}</Text>
              </View>
              {person.skills && person.skills.length > 0 && (
                <Text style={styles.connectionInfo}>
                  {person.skills.slice(0, 3).join(' • ')}
                </Text>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.connectButton,
                  pendingConnections.has(person.id) && styles.connectButtonPending,
                  pressed && styles.buttonPressed,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleConnect(person.id);
                }}
                disabled={pendingConnections.has(person.id)}
              >
                {pendingConnections.has(person.id) ? (
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
            </View>
          </Pressable>
        )))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
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
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 16,
  },
  personCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  personTitle: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  personLocation: {
    fontSize: 13,
    color: Colors.textLight,
  },
  connectionInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 12,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
    alignSelf: 'flex-start',
  },
  connectButtonPending: {
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  connectButtonTextPending: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textLight,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
