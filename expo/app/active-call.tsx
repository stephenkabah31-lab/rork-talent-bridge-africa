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
  Maximize2,
  Users,
  Image as ImageIcon,
  Sparkles,
  X,
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
  Modal,
  ScrollView,
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
  backgroundEffect: string;
  showEffectsMenu: boolean;
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
    backgroundEffect: 'none',
    showEffectsMenu: false,
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
        console.log('🎬 Initializing call...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        console.log('🎤 Requesting microphone permission...');
        const micStatus = await requestMicPermission();
        console.log('🎤 Microphone permission status:', micStatus?.granted);
        
        if (callType === 'video') {
          console.log('📹 Requesting camera permission...');
          const camStatus = await requestCameraPermission();
          console.log('📹 Camera permission status:', camStatus?.granted);
          
          const permissionsOk = micStatus?.granted && camStatus?.granted;
          setPermissionsGranted(permissionsOk);
          
          if (!permissionsOk) {
            console.log('❌ Permissions denied - showing alert');
            setTimeout(() => {
              Alert.alert(
                'Permissions Required',
                'Camera and microphone access is required for video calls. Please enable them in your device settings.',
                [
                  { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
                  { text: 'Go Back', onPress: () => router.back() }
                ]
              );
            }, 100);
            return;
          }
        } else {
          setPermissionsGranted(!!micStatus?.granted);
          
          if (!micStatus?.granted) {
            console.log('❌ Microphone permission denied - showing alert');
            setTimeout(() => {
              Alert.alert(
                'Permission Required',
                'Microphone access is required for calls. Please enable it in your device settings.',
                [
                  { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
                  { text: 'Go Back', onPress: () => router.back() }
                ]
              );
            }, 100);
            return;
          }
        }

        if (micStatus?.granted) {
          console.log('🎙️ Starting audio recording...');
          const recording = new Audio.Recording();
          await recording.prepareToRecordAsync({
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          });
          await recording.startAsync();
          setAudioRecording(recording);
          console.log('✅ Audio recording started - Microphone active');
        }
      } catch (error) {
        console.error('❌ Error initializing call:', error);
        setTimeout(() => {
          Alert.alert(
            'Error',
            'Failed to access camera or microphone. Please check your device settings.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }, 100);
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

  const toggleEffectsMenu = () => {
    setCallState((prev) => ({ ...prev, showEffectsMenu: !prev.showEffectsMenu }));
  };

  const selectBackgroundEffect = (effect: string) => {
    setCallState((prev) => ({ ...prev, backgroundEffect: effect, showEffectsMenu: false }));
    console.log('🎨 Background effect applied:', effect);
  };

  const backgroundEffects = [
    { id: 'none', name: 'None', icon: 'X' },
    { id: 'blur', name: 'Blur', icon: 'Sparkles' },
    { id: 'office', name: 'Office', color: '#8B7355' },
    { id: 'beach', name: 'Beach', color: '#87CEEB' },
    { id: 'space', name: 'Space', color: '#0B1929' },
    { id: 'library', name: 'Library', color: '#654321' },
    { id: 'gradient1', name: 'Gradient Blue', color: '#667EEA' },
    { id: 'gradient2', name: 'Gradient Pink', color: '#F093FB' },
  ];

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
                            callState.backgroundEffect !== 'none' && styles.teamsButtonActive,
                            pressed && styles.buttonPressed,
                          ]}
                          onPress={toggleEffectsMenu}
                        >
                          <ImageIcon color={Colors.white} size={24} />
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
                        callState.backgroundEffect !== 'none' && styles.teamsButtonActive,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={toggleEffectsMenu}
                    >
                      <ImageIcon color={Colors.white} size={24} />
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

        <Modal
          visible={callState.showEffectsMenu}
          transparent
          animationType="slide"
          onRequestClose={toggleEffectsMenu}
        >
          <Pressable style={styles.modalOverlay} onPress={toggleEffectsMenu}>
            <Pressable style={styles.effectsMenu} onPress={(e) => e.stopPropagation()}>
              <View style={styles.effectsHeader}>
                <Text style={styles.effectsTitle}>Background Effects</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={toggleEffectsMenu}
                >
                  <X color={Colors.white} size={24} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.effectsScroll}
                contentContainerStyle={styles.effectsGrid}
              >
                {backgroundEffects.map((effect) => (
                  <Pressable
                    key={effect.id}
                    style={({ pressed }) => [
                      styles.effectCard,
                      callState.backgroundEffect === effect.id && styles.effectCardActive,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => selectBackgroundEffect(effect.id)}
                  >
                    <View
                      style={[
                        styles.effectPreview,
                        effect.color ? { backgroundColor: effect.color } : styles.effectPreviewDefault,
                        effect.id === 'blur' && styles.effectBlur,
                      ]}
                    >
                      {effect.id === 'none' && <X color={Colors.white} size={32} />}
                      {effect.id === 'blur' && <Sparkles color={Colors.white} size={32} />}
                    </View>
                    <Text style={styles.effectName}>{effect.name}</Text>
                    {callState.backgroundEffect === effect.id && (
                      <View style={styles.activeIndicator} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>

              {callState.backgroundEffect !== 'none' && (
                <View style={styles.effectNotice}>
                  <Sparkles color={Colors.secondary} size={16} />
                  <Text style={styles.effectNoticeText}>
                    {callState.backgroundEffect === 'blur' ? 'Background blur active' : 'Virtual background active'}
                  </Text>
                </View>
              )}
            </Pressable>
          </Pressable>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  effectsMenu: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  effectsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  effectsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectsScroll: {
    maxHeight: 450,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  effectCard: {
    width: '30%',
    aspectRatio: 0.75,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  effectCardActive: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  effectPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectPreviewDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  effectBlur: {
    backgroundColor: 'rgba(200, 200, 255, 0.3)',
  },
  effectName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  effectNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  effectNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
});
