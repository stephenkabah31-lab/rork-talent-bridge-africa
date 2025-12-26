import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, User, Phone, Video, Sparkles, Image as ImageIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface WaitingRoomData {
  callId: string;
  candidateName: string;
  isAdmitted: boolean;
  timestamp: number;
}

export default function WaitingRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const callId = params.callId as string;
  const candidateName = params.candidateName as string;
  const callType = (params.callType as 'audio' | 'video') || 'audio';
  const jobTitle = params.jobTitle as string;
  const participantName = params.participantName as string;

  const [pulseAnim] = useState(new Animated.Value(1));
  const [waitingTime, setWaitingTime] = useState(0);
  const [backgroundEffect, setBackgroundEffect] = useState<'none' | 'blur' | 'gradient'>('none');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setInterval(() => {
      setWaitingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [pulseAnim]);

  const { mutate: addToWaitingRoom } = useMutation({
    mutationFn: async () => {
      const stored = await AsyncStorage.getItem('waitingRoom');
      const waitingRoom: WaitingRoomData[] = stored ? JSON.parse(stored) : [];
      
      const newEntry: WaitingRoomData = {
        callId,
        candidateName,
        isAdmitted: false,
        timestamp: Date.now(),
      };

      const existingIndex = waitingRoom.findIndex(
        (entry) => entry.callId === callId && entry.candidateName === candidateName
      );

      if (existingIndex >= 0) {
        waitingRoom[existingIndex] = newEntry;
      } else {
        waitingRoom.push(newEntry);
      }

      await AsyncStorage.setItem('waitingRoom', JSON.stringify(waitingRoom));
      return newEntry;
    },
  });

  const { data: admissionStatus } = useQuery({
    queryKey: ['waitingRoomStatus', callId, candidateName],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('waitingRoom');
      if (!stored) return null;

      const waitingRoom: WaitingRoomData[] = JSON.parse(stored);
      const entry = waitingRoom.find(
        (e) => e.callId === callId && e.candidateName === candidateName
      );

      return entry;
    },
    refetchInterval: 2000,
  });

  useEffect(() => {
    addToWaitingRoom();
  }, [addToWaitingRoom]);

  useEffect(() => {
    if (admissionStatus?.isAdmitted) {
      Alert.alert(
        'Admitted to Call',
        'You have been admitted to the call',
        [
          {
            text: 'Join Now',
            onPress: () => {
              router.replace({
                pathname: '/active-call',
                params: {
                  callId,
                  candidateName,
                  callType,
                  jobTitle: jobTitle || '',
                  backgroundEffect,
                },
              });
            },
          },
        ]
      );
    }
  }, [admissionStatus?.isAdmitted, router, callId, candidateName, callType, jobTitle, backgroundEffect]);

  const handleLeaveWaitingRoom = () => {
    Alert.alert(
      'Leave Waiting Room',
      'Are you sure you want to leave the waiting room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const stored = await AsyncStorage.getItem('waitingRoom');
            if (stored) {
              const waitingRoom: WaitingRoomData[] = JSON.parse(stored);
              const filtered = waitingRoom.filter(
                (e) => !(e.callId === callId && e.candidateName === candidateName)
              );
              await AsyncStorage.setItem('waitingRoom', JSON.stringify(filtered));
            }
            router.back();
          },
        },
      ]
    );
  };

  const formatWaitingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <Text style={styles.title}>Waiting Room</Text>
            <Text style={styles.subtitle}>
              Please wait while the host admits you to the call
            </Text>
          </View>

          <View style={styles.middleSection}>
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {callType === 'video' ? (
                <Video color={Colors.primary} size={64} />
              ) : (
                <Phone color={Colors.primary} size={64} />
              )}
            </Animated.View>

            <View style={styles.participantInfo}>
              <View style={styles.participantIcon}>
                <User color={Colors.white} size={32} />
              </View>
              <Text style={styles.participantName}>{participantName}</Text>
              {jobTitle && <Text style={styles.jobTitle}>{jobTitle}</Text>}
            </View>

            <View style={styles.waitingIndicator}>
              <Clock color={Colors.textLight} size={20} />
              <Text style={styles.waitingText}>
                Waiting for {formatWaitingTime(waitingTime)}
              </Text>
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                The host will let you in soon
              </Text>
            </View>

            {callType === 'video' && (
              <View style={styles.effectsSection}>
                <Text style={styles.effectsTitle}>Background Effects</Text>
                <View style={styles.effectsContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.effectButton,
                      backgroundEffect === 'none' && styles.effectButtonActive,
                      pressed && styles.effectButtonPressed,
                    ]}
                    onPress={() => setBackgroundEffect('none')}
                  >
                    <View style={styles.effectIconContainer}>
                      <Video color={backgroundEffect === 'none' ? Colors.white : Colors.text} size={24} />
                    </View>
                    <Text style={[
                      styles.effectLabel,
                      backgroundEffect === 'none' && styles.effectLabelActive,
                    ]}>None</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.effectButton,
                      backgroundEffect === 'blur' && styles.effectButtonActive,
                      pressed && styles.effectButtonPressed,
                    ]}
                    onPress={() => setBackgroundEffect('blur')}
                  >
                    <View style={styles.effectIconContainer}>
                      <Sparkles color={backgroundEffect === 'blur' ? Colors.white : Colors.text} size={24} />
                    </View>
                    <Text style={[
                      styles.effectLabel,
                      backgroundEffect === 'blur' && styles.effectLabelActive,
                    ]}>Blur</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.effectButton,
                      backgroundEffect === 'gradient' && styles.effectButtonActive,
                      pressed && styles.effectButtonPressed,
                    ]}
                    onPress={() => setBackgroundEffect('gradient')}
                  >
                    <View style={styles.effectIconContainer}>
                      <ImageIcon color={backgroundEffect === 'gradient' ? Colors.white : Colors.text} size={24} />
                    </View>
                    <Text style={[
                      styles.effectLabel,
                      backgroundEffect === 'gradient' && styles.effectLabelActive,
                    ]}>Gradient</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          <View style={styles.bottomSection}>
            <Pressable
              style={({ pressed }) => [
                styles.leaveButton,
                pressed && styles.leaveButtonPressed,
              ]}
              onPress={handleLeaveWaitingRoom}
            >
              <Text style={styles.leaveButtonText}>Leave Waiting Room</Text>
            </Pressable>

            <Text style={styles.helpText}>
              Having trouble? The host may need to manually admit you
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  topSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  middleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  participantInfo: {
    alignItems: 'center',
    gap: 12,
  },
  participantIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  jobTitle: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
  },
  waitingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  waitingText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  bottomSection: {
    gap: 16,
  },
  leaveButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.error,
  },
  leaveButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  effectsSection: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  effectsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  effectsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  effectButton: {
    flex: 1,
    backgroundColor: Colors.light,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  effectButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  effectButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  effectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  effectLabelActive: {
    color: Colors.white,
  },
});
