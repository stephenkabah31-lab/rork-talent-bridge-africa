import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface CallState {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  duration: number;
}

export default function ActiveCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  const callId = params.callId as string;
  const candidateName = params.candidateName as string;
  const callType = (params.callType as 'audio' | 'video') || 'audio';
  const jobTitle = params.jobTitle as string;

  const [callState, setCallState] = useState<CallState>({
    isMuted: false,
    isVideoEnabled: callType === 'video',
    isSpeakerOn: callType === 'audio',
    duration: 0,
  });

  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const timer = setInterval(() => {
      setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(timer);
    };
  }, [pulseAnim]);

  const endCallMutation = useMutation({
    mutationFn: async () => {
      const stored = await AsyncStorage.getItem('scheduledCalls');
      if (!stored) return;

      const calls = JSON.parse(stored);
      const updatedCalls = calls.map((call: { id: string; status: string }) =>
        call.id === callId ? { ...call, status: 'completed' } : call
      );

      await AsyncStorage.setItem('scheduledCalls', JSON.stringify(updatedCalls));
      return updatedCalls;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledCalls'] });
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: async () => {
            await endCallMutation.mutateAsync();
            router.back();
            Alert.alert(
              'Call Ended',
              `Your call with ${candidateName} lasted ${formatDuration(callState.duration)}`
            );
          },
        },
      ]
    );
  };

  const toggleMute = () => {
    setCallState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleVideo = () => {
    setCallState((prev) => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
  };

  const toggleSpeaker = () => {
    setCallState((prev) => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <View style={styles.callInfo}>
              <Text style={styles.callStatus}>Connected</Text>
              <Animated.View
                style={[
                  styles.avatarContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={styles.avatar}>
                  <User color={Colors.white} size={64} />
                </View>
              </Animated.View>
              <Text style={styles.candidateName}>{candidateName}</Text>
              {jobTitle && <Text style={styles.jobTitle}>{jobTitle}</Text>}
              <Text style={styles.duration}>{formatDuration(callState.duration)}</Text>
            </View>

            {callType === 'video' && !callState.isVideoEnabled && (
              <View style={styles.videoOffNotice}>
                <VideoOff color={Colors.white} size={24} />
                <Text style={styles.videoOffText}>Camera is off</Text>
              </View>
            )}

            <View style={styles.controls}>
              <View style={styles.controlsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.controlButton,
                    callState.isMuted && styles.controlButtonActive,
                    pressed && styles.controlButtonPressed,
                  ]}
                  onPress={toggleMute}
                >
                  {callState.isMuted ? (
                    <MicOff color={Colors.white} size={28} />
                  ) : (
                    <Mic color={Colors.white} size={28} />
                  )}
                  <Text style={styles.controlLabel}>
                    {callState.isMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </Pressable>

                {callType === 'video' && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.controlButton,
                      !callState.isVideoEnabled && styles.controlButtonActive,
                      pressed && styles.controlButtonPressed,
                    ]}
                    onPress={toggleVideo}
                  >
                    {callState.isVideoEnabled ? (
                      <Video color={Colors.white} size={28} />
                    ) : (
                      <VideoOff color={Colors.white} size={28} />
                    )}
                    <Text style={styles.controlLabel}>
                      {callState.isVideoEnabled ? 'Stop Video' : 'Start Video'}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.controlButton,
                    callState.isSpeakerOn && styles.controlButtonActive,
                    pressed && styles.controlButtonPressed,
                  ]}
                  onPress={toggleSpeaker}
                >
                  <Volume2 color={Colors.white} size={28} />
                  <Text style={styles.controlLabel}>
                    {callState.isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.endCallButton,
                  pressed && styles.endCallButtonPressed,
                ]}
                onPress={handleEndCall}
              >
                <PhoneOff color={Colors.white} size={32} />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  callInfo: {
    alignItems: 'center',
    paddingTop: 40,
  },
  callStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 40,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  avatarContainer: {
    marginBottom: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.secondary,
  },
  candidateName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  duration: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  videoOffNotice: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  videoOffText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: 20,
    gap: 32,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 100,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  controlButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  endCallButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
