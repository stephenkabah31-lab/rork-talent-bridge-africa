import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  Phone,
  Video,
  Clock,
  Calendar,
  PhoneOff,
  ChevronRight,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface Call {
  id: string;
  name: string;
  type: 'audio' | 'video';
  status: 'scheduled' | 'completed' | 'missed';
  date: string;
  time: string;
  duration?: string;
  jobTitle?: string;
}

const MOCK_CALLS: Call[] = [
  {
    id: '1',
    name: 'Amara Okafor',
    type: 'video',
    status: 'scheduled',
    date: 'Today',
    time: '2:00 PM',
    jobTitle: 'Interview - Senior Software Engineer',
  },
  {
    id: '2',
    name: 'Kwame Mensah',
    type: 'audio',
    status: 'scheduled',
    date: 'Tomorrow',
    time: '10:30 AM',
    jobTitle: 'Initial Screening - Product Manager',
  },
  {
    id: '3',
    name: 'Zainab Hassan',
    type: 'video',
    status: 'completed',
    date: 'Yesterday',
    time: '3:00 PM',
    duration: '45 min',
    jobTitle: 'Design Review - UI/UX Designer',
  },
  {
    id: '4',
    name: 'AfriTech Solutions',
    type: 'video',
    status: 'completed',
    date: '2 days ago',
    time: '11:00 AM',
    duration: '30 min',
    jobTitle: 'Technical Interview',
  },
  {
    id: '5',
    name: 'Tech Corp',
    type: 'audio',
    status: 'missed',
    date: '3 days ago',
    time: '4:00 PM',
    jobTitle: 'Follow-up Call',
  },
];

export default function CallsTabScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const filteredCalls = MOCK_CALLS.filter((call) => {
    if (filter === 'all') return true;
    return call.status === filter;
  });

  const handleJoinCall = (call: Call) => {
    if (call.status !== 'scheduled') return;

    if (user?.userType === 'professional') {
      router.push({
        pathname: '/waiting-room',
        params: {
          callId: call.id,
          candidateName: user?.fullName || 'Candidate',
          callType: call.type,
          participantName: call.name,
          jobTitle: call.jobTitle || '',
        },
      });
    } else {
      router.push({
        pathname: '/admit-candidates' as any,
        params: {
          callId: call.id,
          callType: call.type,
          participantName: call.name,
          jobTitle: call.jobTitle || '',
        },
      });
    }
  };

  const handleScheduleCall = () => {
    if (user?.userType === 'recruiter' || user?.userType === 'company') {
      router.push('/schedule-call');
    } else {
      Alert.alert(
        'Schedule Call',
        'To schedule a call, please contact the recruiter through messages.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusColor = (status: Call['status']) => {
    switch (status) {
      case 'scheduled':
        return Colors.primary;
      case 'completed':
        return Colors.success;
      case 'missed':
        return Colors.error;
      default:
        return Colors.textLight;
    }
  };

  const renderCall = ({ item }: { item: Call }) => (
    <Pressable
      style={({ pressed }) => [
        styles.callItem,
        pressed && styles.callItemPressed,
      ]}
      onPress={() => {
        if (item.status === 'scheduled') {
          handleJoinCall(item);
        }
      }}
    >
      <View style={[styles.callIcon, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
        {item.type === 'video' ? (
          <Video color={getStatusColor(item.status)} size={24} />
        ) : (
          <Phone color={getStatusColor(item.status)} size={24} />
        )}
      </View>

      <View style={styles.callContent}>
        <Text style={styles.callName}>{item.name}</Text>
        {item.jobTitle && (
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.jobTitle}
          </Text>
        )}
        <View style={styles.callDetails}>
          <Clock color={Colors.textLight} size={14} />
          <Text style={styles.callTime}>
            {item.date} at {item.time}
          </Text>
          {item.duration && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.callDuration}>{item.duration}</Text>
            </>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      {item.status === 'scheduled' && (
        <ChevronRight color={Colors.textLight} size={20} />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calls</Text>
        {(user?.userType === 'recruiter' || user?.userType === 'company') && (
          <Pressable
            style={({ pressed }) => [
              styles.scheduleButton,
              pressed && styles.scheduleButtonPressed,
            ]}
            onPress={handleScheduleCall}
          >
            <Calendar color={Colors.primary} size={20} />
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </Pressable>
        )}
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
          style={[styles.filterButton, filter === 'scheduled' && styles.filterButtonActive]}
          onPress={() => setFilter('scheduled')}
        >
          <Text style={[styles.filterText, filter === 'scheduled' && styles.filterTextActive]}>
            Scheduled
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </Pressable>
      </View>

      {filteredCalls.length > 0 ? (
        <FlatList
          data={filteredCalls}
          renderItem={renderCall}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <PhoneOff color={Colors.textLight} size={64} />
          <Text style={styles.emptyTitle}>No Calls</Text>
          <Text style={styles.emptyText}>
            {filter === 'scheduled'
              ? 'You have no scheduled calls'
              : filter === 'completed'
              ? 'You have no completed calls'
              : 'Schedule calls with candidates or recruiters to get started'}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  scheduleButtonPressed: {
    opacity: 0.7,
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingVertical: 8,
  },
  callItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  callItemPressed: {
    backgroundColor: Colors.light,
  },
  callIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callContent: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  callTime: {
    fontSize: 13,
    color: Colors.textLight,
  },
  dot: {
    fontSize: 13,
    color: Colors.textLight,
  },
  callDuration: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
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
