import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Search, UserPlus, UserCheck, MapPin } from 'lucide-react-native';
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
  mutualConnections?: number;
  profilePicture?: string;
  isPending?: boolean;
}

const MOCK_PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Kwame Mensah',
    title: 'Software Engineer at Andela',
    location: 'Accra, Ghana',
    connections: 342,
    mutualConnections: 12,
    profilePicture: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'p2',
    name: 'Amara Okafor',
    title: 'Product Designer | Startups',
    location: 'Lagos, Nigeria',
    connections: 589,
    mutualConnections: 8,
    profilePicture: 'https://i.pravatar.cc/150?img=45',
  },
  {
    id: 'p3',
    name: 'Tendai Moyo',
    title: 'Data Scientist at IBM',
    location: 'Johannesburg, South Africa',
    connections: 721,
    mutualConnections: 15,
    profilePicture: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: 'p4',
    name: 'Fatima Hassan',
    title: 'Marketing Specialist',
    location: 'Cairo, Egypt',
    connections: 456,
    mutualConnections: 5,
    profilePicture: 'https://i.pravatar.cc/150?img=28',
  },
  {
    id: 'p5',
    name: 'John Omondi',
    title: 'Business Analyst at Safaricom',
    location: 'Nairobi, Kenya',
    connections: 523,
    mutualConnections: 20,
    profilePicture: 'https://i.pravatar.cc/150?img=51',
  },
];

export default function PeopleSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [people, setPeople] = useState<Person[]>(MOCK_PEOPLE);

  const filteredPeople = people.filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = (personId: string) => {
    setPeople((prev) =>
      prev.map((person) =>
        person.id === personId ? { ...person, isPending: true } : person
      )
    );
  };

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

        {filteredPeople.map((person) => (
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
                  <Text style={styles.avatarText}>{person.name.charAt(0)}</Text>
                </View>
              )}
            </View>

            <View style={styles.personInfo}>
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.personTitle} numberOfLines={2}>
                {person.title}
              </Text>
              <View style={styles.locationRow}>
                <MapPin color={Colors.textLight} size={14} />
                <Text style={styles.personLocation}>{person.location}</Text>
              </View>
              <Text style={styles.connectionInfo}>
                {person.connections} connections
                {person.mutualConnections && ` • ${person.mutualConnections} mutual`}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.connectButton,
                  person.isPending && styles.connectButtonPending,
                  pressed && styles.buttonPressed,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleConnect(person.id);
                }}
                disabled={person.isPending}
              >
                {person.isPending ? (
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
