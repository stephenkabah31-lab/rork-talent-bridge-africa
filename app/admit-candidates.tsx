import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Video,
  Clock,
  UserCheck,
  UserX,
  PhoneCall,
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface WaitingRoomData {
  callId: string;
  candidateName: string;
  isAdmitted: boolean;
  timestamp: number;
}

export default function AdmitCandidatesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  const callId = params.callId as string;
  const callType = (params.callType as 'audio' | 'video') || 'audio';
  const participantName = params.participantName as string;
  const jobTitle = params.jobTitle as string;

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  React.useEffect(() => {
    if (user && user.type !== 'recruiter' && user.type !== 'company') {
      Alert.alert(
        'Access Restricted',
        'Only recruiters can admit candidates to calls.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [user, router]);

  const { data: waitingCandidates = [] } = useQuery<WaitingRoomData[]>({
    queryKey: ['waitingRoom', callId],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('waitingRoom');
      if (!stored) return [];

      const waitingRoom: WaitingRoomData[] = JSON.parse(stored);
      return waitingRoom.filter((entry) => entry.callId === callId && !entry.isAdmitted);
    },
    refetchInterval: 2000,
  });

  const admitCandidateMutation = useMutation({
    mutationFn: async (candidateName: string) => {
      const stored = await AsyncStorage.getItem('waitingRoom');
      if (!stored) return;

      const waitingRoom: WaitingRoomData[] = JSON.parse(stored);
      const updated = waitingRoom.map((entry) =>
        entry.callId === callId && entry.candidateName === candidateName
          ? { ...entry, isAdmitted: true }
          : entry
      );

      await AsyncStorage.setItem('waitingRoom', JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitingRoom', callId] });
    },
  });

  const removeCandidateMutation = useMutation({
    mutationFn: async (candidateName: string) => {
      const stored = await AsyncStorage.getItem('waitingRoom');
      if (!stored) return;

      const waitingRoom: WaitingRoomData[] = JSON.parse(stored);
      const filtered = waitingRoom.filter(
        (entry) => !(entry.callId === callId && entry.candidateName === candidateName)
      );

      await AsyncStorage.setItem('waitingRoom', JSON.stringify(filtered));
      return filtered;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitingRoom', callId] });
    },
  });

  const handleAdmitCandidate = (candidate: WaitingRoomData) => {
    Alert.alert(
      'Admit Candidate',
      `Admit ${candidate.candidateName} to the call?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Admit',
          onPress: () => admitCandidateMutation.mutate(candidate.candidateName),
        },
      ]
    );
  };

  const handleRemoveCandidate = (candidate: WaitingRoomData) => {
    Alert.alert(
      'Remove Candidate',
      `Remove ${candidate.candidateName} from the waiting room?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeCandidateMutation.mutate(candidate.candidateName),
        },
      ]
    );
  };

  const handleStartCall = () => {
    if (waitingCandidates.length > 0) {
      Alert.alert(
        'Candidates Waiting',
        'There are candidates still waiting. Please admit them first or remove them from the waiting room.',
        [{ text: 'OK', style: 'cancel' }]
      );
    } else {
      router.push({
        pathname: '/active-call',
        params: {
          callId,
          candidateName: user?.name || 'Recruiter',
          callType,
          jobTitle: jobTitle || '',
        },
      });
    }
  };

  const getWaitingTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCandidate = ({ item }: { item: WaitingRoomData }) => (
    <View style={styles.candidateCard}>
      <View style={styles.candidateInfo}>
        <View style={styles.candidateIcon}>
          <User color={Colors.primary} size={24} />
        </View>
        <View style={styles.candidateDetails}>
          <Text style={styles.candidateName}>{item.candidateName}</Text>
          <View style={styles.waitingTime}>
            <Clock color={Colors.textLight} size={14} />
            <Text style={styles.waitingText}>
              Waiting for {getWaitingTime(item.timestamp)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.candidateActions}>
        <Pressable
          style={({ pressed }) => [
            styles.admitButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleAdmitCandidate(item)}
        >
          <UserCheck color={Colors.white} size={18} />
          <Text style={styles.admitButtonText}>Admit</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleRemoveCandidate(item)}
        >
          <UserX color={Colors.error} size={18} />
        </Pressable>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Waiting Room</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.callInfo}>
          <View style={styles.callTypeIcon}>
            {callType === 'video' ? (
              <Video color={Colors.primary} size={32} />
            ) : (
              <Phone color={Colors.primary} size={32} />
            )}
          </View>
          <Text style={styles.participantName}>{participantName}</Text>
          {jobTitle && <Text style={styles.jobTitle}>{jobTitle}</Text>}
        </View>

        <View style={styles.waitingSection}>
          <View style={styles.waitingSectionHeader}>
            <Text style={styles.waitingSectionTitle}>
              Waiting Candidates ({waitingCandidates.length})
            </Text>
          </View>

          {waitingCandidates.length > 0 ? (
            <FlatList
              data={waitingCandidates}
              renderItem={renderCandidate}
              keyExtractor={(item) => `${item.callId}-${item.candidateName}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <User color={Colors.textLight} size={48} />
              <Text style={styles.emptyTitle}>No Candidates Waiting</Text>
              <Text style={styles.emptyText}>
                Candidates will appear here when they join the waiting room
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.startCallButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStartCall}
          >
            <PhoneCall color={Colors.white} size={20} />
            <Text style={styles.startCallButtonText}>Start Call</Text>
          </Pressable>
        </View>
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
  callInfo: {
    backgroundColor: Colors.white,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  callTypeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  participantName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
  },
  waitingSection: {
    flex: 1,
  },
  waitingSectionHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  waitingSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  candidateCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  candidateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  waitingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waitingText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  candidateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  admitButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  admitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  removeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startCallButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startCallButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
