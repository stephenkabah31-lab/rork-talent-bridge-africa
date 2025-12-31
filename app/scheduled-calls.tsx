import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Video,
  User,
  X,
  PhoneCall,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface ScheduledCall {
  id: string;
  date: string;
  time: string;
  duration: string;
  callType: 'audio' | 'video';
  notes: string;
  candidateName: string;
  jobTitle?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export default function ScheduledCallsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: calls = [], isLoading } = useQuery<ScheduledCall[]>({
    queryKey: ['scheduledCalls'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('scheduledCalls');
      return stored ? JSON.parse(stored) : [];
    },
  });

  const cancelCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const updatedCalls = calls.map((call) =>
        call.id === callId ? { ...call, status: 'cancelled' as const } : call
      );
      await AsyncStorage.setItem('scheduledCalls', JSON.stringify(updatedCalls));
      return updatedCalls;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledCalls'] });
      Alert.alert('Success', 'Call cancelled successfully');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to cancel call');
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['scheduledCalls'] });
    setRefreshing(false);
  };

  const handleCancelCall = (call: ScheduledCall) => {
    Alert.alert(
      'Cancel Call',
      `Are you sure you want to cancel the call with ${call.candidateName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelCallMutation.mutate(call.id),
        },
      ]
    );
  };

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const handleJoinCall = (call: ScheduledCall) => {
    const isRecruiter = user?.userType === 'recruiter' || user?.userType === 'company';
    
    if (isRecruiter) {
      router.push({
        pathname: '/admit-candidates' as any,
        params: {
          callId: call.id,
          callType: call.callType,
          participantName: call.candidateName,
          jobTitle: call.jobTitle || '',
        },
      });
    } else {
      router.push({
        pathname: '/waiting-room' as any,
        params: {
          callId: call.id,
          candidateName: user?.name || 'Candidate',
          callType: call.callType,
          jobTitle: call.jobTitle || '',
          participantName: call.candidateName,
        },
      });
    }
  };

  const scheduledCalls = calls.filter((call) => call.status === 'scheduled');
  const pastCalls = calls.filter(
    (call) => call.status === 'completed' || call.status === 'cancelled'
  );

  const isCallNow = (call: ScheduledCall) => {
    const now = new Date();
    const callDateTime = new Date(`${call.date} ${call.time}`);
    const diffMinutes = (callDateTime.getTime() - now.getTime()) / 1000 / 60;
    return diffMinutes >= -5 && diffMinutes <= 15;
  };

  const formatDateTime = (date: string, time: string) => {
    const callDate = new Date(`${date} ${time}`);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = '';
    if (callDate.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (callDate.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = callDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    return `${dateStr} at ${time}`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <ArrowLeft color={Colors.text} size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Scheduled Calls</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading calls...</Text>
            </View>
          ) : scheduledCalls.length === 0 && pastCalls.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Phone color={Colors.textLight} size={48} />
              <Text style={styles.emptyTitle}>No Scheduled Calls</Text>
              <Text style={styles.emptyText}>
                Schedule a call with candidates from the messages screen
              </Text>
            </View>
          ) : (
            <>
              {scheduledCalls.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Upcoming ({scheduledCalls.length})
                  </Text>

                  {scheduledCalls.map((call) => (
                    <View key={call.id} style={styles.callCard}>
                      <View style={styles.callHeader}>
                        <View style={styles.candidateInfo}>
                          <View style={styles.candidateIcon}>
                            <User color={Colors.primary} size={20} />
                          </View>
                          <View style={styles.candidateDetails}>
                            <Text style={styles.candidateName}>
                              {call.candidateName}
                            </Text>
                            {call.jobTitle && (
                              <Text style={styles.jobTitle}>Position: {call.jobTitle}</Text>
                            )}
                          </View>
                        </View>

                        {call.callType === 'video' ? (
                          <View style={styles.callTypeBadge}>
                            <Video color={Colors.primary} size={16} />
                          </View>
                        ) : (
                          <View style={styles.callTypeBadge}>
                            <Phone color={Colors.primary} size={16} />
                          </View>
                        )}
                      </View>

                      <View style={styles.callDetails}>
                        <View style={styles.detailRow}>
                          <Calendar color={Colors.textLight} size={16} />
                          <Text style={styles.detailText}>
                            {formatDateTime(call.date, call.time)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Clock color={Colors.textLight} size={16} />
                          <Text style={styles.detailText}>{call.duration}</Text>
                        </View>
                      </View>

                      {call.notes && (
                        <View style={styles.notesBox}>
                          <Text style={styles.notesLabel}>Notes:</Text>
                          <Text style={styles.notesText}>{call.notes}</Text>
                        </View>
                      )}

                      <View style={styles.callActions}>
                        {isCallNow(call) && (
                          <Pressable
                            style={({ pressed }) => [
                              styles.joinButton,
                              pressed && styles.buttonPressed,
                            ]}
                            onPress={() => handleJoinCall(call)}
                          >
                            <PhoneCall color={Colors.white} size={18} />
                            <Text style={styles.joinButtonText}>Join Now</Text>
                          </Pressable>
                        )}
                        <Pressable
                          style={({ pressed }) => [
                            styles.cancelButton,
                            pressed && styles.buttonPressed,
                          ]}
                          onPress={() => handleCancelCall(call)}
                        >
                          <X color={Colors.error} size={18} />
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {pastCalls.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Past Calls</Text>

                  {pastCalls.map((call) => (
                    <View key={call.id} style={[styles.callCard, styles.pastCallCard]}>
                      <View style={styles.callHeader}>
                        <View style={styles.candidateInfo}>
                          <View style={[styles.candidateIcon, styles.pastIcon]}>
                            <User color={Colors.textLight} size={20} />
                          </View>
                          <View style={styles.candidateDetails}>
                            <Text style={styles.candidateName}>
                              {call.candidateName}
                            </Text>
                            {call.jobTitle && (
                              <Text style={styles.jobTitle}>Position: {call.jobTitle}</Text>
                            )}
                          </View>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            call.status === 'completed' && styles.completedBadge,
                            call.status === 'cancelled' && styles.cancelledBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              call.status === 'completed' && styles.completedText,
                              call.status === 'cancelled' && styles.cancelledText,
                            ]}
                          >
                            {call.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.callDetails}>
                        <View style={styles.detailRow}>
                          <Calendar color={Colors.textLight} size={16} />
                          <Text style={styles.detailText}>
                            {formatDateTime(call.date, call.time)}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Clock color={Colors.textLight} size={16} />
                          <Text style={styles.detailText}>{call.duration}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    paddingHorizontal: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  callCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pastCallCard: {
    opacity: 0.7,
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  candidateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastIcon: {
    backgroundColor: '#F5F5F5',
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  callTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
  },
  notesBox: {
    backgroundColor: Colors.light,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  callActions: {
    flexDirection: 'row',
    gap: 8,
  },
  joinButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  completedText: {
    color: Colors.success,
  },
  cancelledText: {
    color: Colors.error,
  },
});
