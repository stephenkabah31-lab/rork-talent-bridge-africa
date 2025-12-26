import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  User,
  SwitchCamera,
  MessageSquare,
  MoreVertical,
  Maximize2,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
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
  cameraType: CameraType;
  showControls: boolean;
  isFullscreen: boolean;
}

export default function ActiveCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  const callId = params.callId as string;
  const candidateName = params.candidateName as string;
  const callType = (params.callType as 'audio' | 'video') || 'audio';
  const jobTitle = params.jobTitle as string;

  const [, requestCameraPermission] = useCameraPermissions();
  const [, requestMicPermission] = useMicrophonePermissions();
  const [audioRecording, setAudioRecording] = useState<Audio.Recording | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const [callState, setCallState] = useState<CallState>({
    isMuted: false,
    isVideoEnabled: callType === 'video',
    isSpeakerOn: callType === 'audio',
    duration: 0,
    cameraType: 'front' as CameraType,
    showControls: true,
    isFullscreen: false,
  });

  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const initializeCall = async () => {
      if (Platform.OS === 'web') {
        console.log('Audio/video permissions handled by browser on web');
        setPermissionsGranted(true);
        return;
      }

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const micStatus = await requestMicPermission();
        
        if (callType === 'video') {
          const camStatus = await requestCameraPermission();
          setPermissionsGranted(micStatus?.granted && camStatus?.granted);
          
          if (!micStatus?.granted || !camStatus?.granted) {
            Alert.alert(
              'Permissions Required',
              'Camera and microphone access is required for video calls.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
            return;
          }
        } else {
          setPermissionsGranted(micStatus?.granted);
          
          if (!micStatus?.granted) {
            Alert.alert(
              'Permission Required',
              'Microphone access is required for calls.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
            return;
          }
        }

        if (micStatus?.granted) {
          const recording = new Audio.Recording();
          await recording.prepareToRecordAsync({
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          });
          await recording.startAsync();
          setAudioRecording(recording);
          console.log('✅ Audio recording started - Microphone active');
        }
      } catch (error) {
        console.error('Error initializing call:', error);
        Alert.alert('Permission Error', 'Failed to access camera or microphone');
      }
    };

    initializeCall();

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
      setAudioRecording((prevRecording) => {
        if (prevRecording) {
          prevRecording.stopAndUnloadAsync().catch(console.error);
        }
        return null;
      });
    };
  }, [callType, router, requestCameraPermission, requestMicPermission, pulseAnim]);

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
            if (audioRecording) {
              await audioRecording.stopAndUnloadAsync();
              setAudioRecording(null);
              console.log('🔴 Call ended - Audio recording stopped');
            }
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

  const toggleMute = async () => {
    const newMutedState = !callState.isMuted;
    setCallState((prev) => ({ ...prev, isMuted: newMutedState }));

    if (Platform.OS !== 'web') {
      try {
        if (newMutedState && audioRecording) {
          await audioRecording.stopAndUnloadAsync();
          setAudioRecording(null);
          console.log('🔇 Microphone muted');
        } else if (!newMutedState && !audioRecording) {
          const recording = new Audio.Recording();
          await recording.prepareToRecordAsync({
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          });
          await recording.startAsync();
          setAudioRecording(recording);
          console.log('🎤 Microphone unmuted');
        }
      } catch (error) {
        console.error('Error toggling microphone:', error);
      }
    }
  };

  const toggleVideo = () => {
    setCallState((prev) => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
    console.log('📹 Video toggled:', !callState.isVideoEnabled);
  };

  const toggleSpeaker = async () => {
    const newSpeakerState = !callState.isSpeakerOn;
    setCallState((prev) => ({ ...prev, isSpeakerOn: newSpeakerState }));

    if (Platform.OS !== 'web') {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: !newSpeakerState,
        });
        console.log('🔊 Speaker toggled:', newSpeakerState);
      } catch (error) {
        console.error('Error toggling speaker:', error);
      }
    }
  };

  const flipCamera = () => {
    setCallState((prev) => ({
      ...prev,
      cameraType: prev.cameraType === 'back' ? 'front' : 'back',
    }));
    console.log('🔄 Camera flipped');
  };

  const toggleFullscreen = () => {
    setCallState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const toggleControls = () => {
    setCallState((prev) => ({ ...prev, showControls: !prev.showControls }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        {callType === 'video' && callState.isVideoEnabled && permissionsGranted && Platform.OS !== 'web' ? (
          <Pressable style={styles.camera} onPress={toggleControls}>
            <CameraView
              style={styles.cameraView}
              facing={callState.cameraType}
            >
              <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {callState.showControls && (
                  <View style={styles.videoTopBar}>
                    <View style={styles.topBarLeft}>
                      <View style={styles.connectionIndicator}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.connectionText}>{formatDuration(callState.duration)}</Text>
                      </View>
                    </View>
                    <View style={styles.topBarCenter}>
                      <Text style={styles.participantNameTop}>{candidateName}</Text>
                      {jobTitle && <Text style={styles.participantRole}>{jobTitle}</Text>}
                    </View>
                    <View style={styles.topBarRight}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.topBarButton,
                          pressed && styles.buttonPressed,
                        ]}
                        onPress={toggleFullscreen}
                      >
                        <Maximize2 color={Colors.white} size={20} />
                      </Pressable>
                    </View>
                  </View>
                )}

                <View style={styles.selfViewContainer}>
                  <View style={styles.selfView}>
                    <User color={Colors.white} size={32} />
                  </View>
                </View>

                {callState.showControls && (
                  <View style={styles.teamsControlsContainer}>
                    <View style={styles.teamsControls}>
                      <View style={styles.teamsControlsRow}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.teamsButton,
                            callState.isMuted && styles.teamsButtonActive,
                            pressed && styles.buttonPressed,
                          ]}
                          onPress={toggleMute}
                        >
                          {callState.isMuted ? (
                            <MicOff color={Colors.white} size={24} />
                          ) : (
                            <Mic color={Colors.white} size={24} />
                          )}
                        </Pressable>

                        <Pressable
                          style={({ pressed }) => [
                            styles.teamsButton,
                            !callState.isVideoEnabled && styles.teamsButtonActive,
                            pressed && styles.buttonPressed,
                          ]}
                          onPress={toggleVideo}
                        >
                          {callState.isVideoEnabled ? (
                            <Video color={Colors.white} size={24} />
                          ) : (
                            <VideoOff color={Colors.white} size={24} />
                          )}
                        </Pressable>

                        <Pressable
                          style={({ pressed }) => [
                            styles.teamsButton,
                            pressed && styles.buttonPressed,
                          ]}
                          onPress={flipCamera}
                        >
                          <SwitchCamera color={Colors.white} size={24} />
                        </Pressable>

                        <Pressable
                          style={({ pressed }) => [
                            styles.teamsButton,
                            pressed && styles.buttonPressed,
                          ]}
                          onPress={toggleSpeaker}
                        >
                          <Volume2 color={Colors.white} size={24} />
                        </Pressable>

                        <Pressable
                          style={({ pressed }) => [
                            styles.teamsButton,
                            pressed && styles.buttonPressed,
                          ]}
                        >
                          <MessageSquare color={Colors.white} size={24} />
                        </Pressable>

                        <Pressable
                          style={({ pressed }) => [
                            styles.teamsButton,
                            pressed && styles.buttonPressed,
                          ]}
                        >
                          <MoreVertical color={Colors.white} size={24} />
                        </Pressable>

                        <Pressable
                          style={({ pressed }) => [
                            styles.teamsEndButton,
                            pressed && styles.buttonPressed,
                          ]}
                          onPress={handleEndCall}
                        >
                          <PhoneOff color={Colors.white} size={24} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </SafeAreaView>
            </CameraView>
          </Pressable>
        ) : (
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

              <View style={styles.teamsControlsContainer}>
                <View style={styles.teamsControls}>
                  <View style={styles.teamsControlsRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.teamsButton,
                        callState.isMuted && styles.teamsButtonActive,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={toggleMute}
                    >
                      {callState.isMuted ? (
                        <MicOff color={Colors.white} size={24} />
                      ) : (
                        <Mic color={Colors.white} size={24} />
                      )}
                    </Pressable>

                    {callType === 'video' && (
                      <Pressable
                        style={({ pressed }) => [
                          styles.teamsButton,
                          !callState.isVideoEnabled && styles.teamsButtonActive,
                          pressed && styles.buttonPressed,
                        ]}
                        onPress={toggleVideo}
                      >
                        {callState.isVideoEnabled ? (
                          <Video color={Colors.white} size={24} />
                        ) : (
                          <VideoOff color={Colors.white} size={24} />
                        )}
                      </Pressable>
                    )}

                    <Pressable
                      style={({ pressed }) => [
                        styles.teamsButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={toggleSpeaker}
                    >
                      <Volume2 color={Colors.white} size={24} />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.teamsButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <MessageSquare color={Colors.white} size={24} />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.teamsButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Users color={Colors.white} size={24} />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.teamsButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <MoreVertical color={Colors.white} size={24} />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.teamsEndButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={handleEndCall}
                    >
                      <PhoneOff color={Colors.white} size={24} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  camera: {
    flex: 1,
  },
  cameraView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBarLeft: {
    flex: 1,
  },
  topBarCenter: {
    flex: 2,
    alignItems: 'center',
  },
  topBarRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  connectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  participantNameTop: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  participantRole: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  topBarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfViewContainer: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selfView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  teamsControlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  teamsControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  teamsControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamsButtonActive: {
    backgroundColor: '#D32F2F',
  },
  teamsEndButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
