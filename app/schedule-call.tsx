import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
  User,
  Video,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface ScheduleCallData {
  date: string;
  time: string;
  duration: string;
  callType: 'audio' | 'video';
  notes: string;
  candidateName: string;
  jobTitle?: string;
}

const DURATION_OPTIONS = ['15 min', '30 min', '45 min', '60 min'];

export default function ScheduleCallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const candidateName = (params.candidateName as string) || '';
  const jobTitle = params.jobTitle as string;

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  useEffect(() => {
    if (user && user.userType !== 'recruiter' && user.userType !== 'company') {
      Alert.alert(
        'Access Restricted',
        'Only recruiters and companies can schedule interviews.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [user, router]);

  const [callData, setCallData] = useState<ScheduleCallData>({
    date: '',
    time: '',
    duration: '30 min',
    callType: 'audio',
    notes: '',
    candidateName,
    jobTitle,
  });
  const [isLoading, setIsLoading] = useState(false);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        full: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
      });
    }
    return dates;
  };

  const handleScheduleCall = async () => {
    if (!callData.date || !callData.time) {
      Alert.alert('Missing Information', 'Please select date and time');
      return;
    }

    setIsLoading(true);

    try {
      const scheduledCall = {
        id: Date.now().toString(),
        ...callData,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };

      const stored = await AsyncStorage.getItem('scheduledCalls');
      const calls = stored ? JSON.parse(stored) : [];
      calls.push(scheduledCall);
      await AsyncStorage.setItem('scheduledCalls', JSON.stringify(calls));

      console.log('Call scheduled:', scheduledCall);

      Alert.alert(
        'Call Scheduled! 📞',
        `Your ${callData.callType} call with ${candidateName} has been scheduled for ${callData.date} at ${callData.time}. Both parties will receive a notification.`,
        [
          {
            text: 'View Calls',
            onPress: () => router.push('/scheduled-calls'),
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error scheduling call:', error);
      Alert.alert('Error', 'Failed to schedule call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
          <Text style={styles.headerTitle}>Schedule Call</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.candidateInfo}>
            <View style={styles.candidateIcon}>
              <User color={Colors.primary} size={24} />
            </View>
            <View>
              <Text style={styles.candidateName}>{candidateName}</Text>
              {jobTitle && (
                <Text style={styles.candidateRole}>Applying for: {jobTitle}</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Call Type</Text>
            <View style={styles.callTypeContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.callTypeOption,
                  callData.callType === 'audio' && styles.callTypeSelected,
                  pressed && styles.callTypePressed,
                ]}
                onPress={() =>
                  setCallData((prev) => ({ ...prev, callType: 'audio' }))
                }
              >
                <Phone
                  color={
                    callData.callType === 'audio' ? Colors.white : Colors.primary
                  }
                  size={24}
                />
                <Text
                  style={[
                    styles.callTypeText,
                    callData.callType === 'audio' && styles.callTypeTextSelected,
                  ]}
                >
                  Audio Call
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.callTypeOption,
                  callData.callType === 'video' && styles.callTypeSelected,
                  pressed && styles.callTypePressed,
                ]}
                onPress={() =>
                  setCallData((prev) => ({ ...prev, callType: 'video' }))
                }
              >
                <Video
                  color={
                    callData.callType === 'video' ? Colors.white : Colors.primary
                  }
                  size={24}
                />
                <Text
                  style={[
                    styles.callTypeText,
                    callData.callType === 'video' && styles.callTypeTextSelected,
                  ]}
                >
                  Video Call
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScroll}
            >
              {getNextWeekDates().map((date) => (
                <Pressable
                  key={date.full}
                  style={({ pressed }) => [
                    styles.dateOption,
                    callData.date === date.full && styles.dateSelected,
                    pressed && styles.datePressed,
                  ]}
                  onPress={() =>
                    setCallData((prev) => ({ ...prev, date: date.full }))
                  }
                >
                  <Calendar
                    color={
                      callData.date === date.full ? Colors.white : Colors.primary
                    }
                    size={20}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      callData.date === date.full && styles.dateTextSelected,
                    ]}
                  >
                    {date.display}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timeGrid}>
              {generateTimeSlots().map((slot) => (
                <Pressable
                  key={slot}
                  style={({ pressed }) => [
                    styles.timeOption,
                    callData.time === slot && styles.timeSelected,
                    pressed && styles.timePressed,
                  ]}
                  onPress={() =>
                    setCallData((prev) => ({ ...prev, time: slot }))
                  }
                >
                  <Text
                    style={[
                      styles.timeText,
                      callData.time === slot && styles.timeTextSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <View style={styles.durationContainer}>
              {DURATION_OPTIONS.map((duration) => (
                <Pressable
                  key={duration}
                  style={({ pressed }) => [
                    styles.durationOption,
                    callData.duration === duration && styles.durationSelected,
                    pressed && styles.durationPressed,
                  ]}
                  onPress={() =>
                    setCallData((prev) => ({ ...prev, duration }))
                  }
                >
                  <Clock
                    color={
                      callData.duration === duration
                        ? Colors.white
                        : Colors.primary
                    }
                    size={18}
                  />
                  <Text
                    style={[
                      styles.durationText,
                      callData.duration === duration &&
                        styles.durationTextSelected,
                    ]}
                  >
                    {duration}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <View style={styles.notesContainer}>
              <MessageSquare color={Colors.textLight} size={20} />
              <TextInput
                style={styles.notesInput}
                placeholder="Add agenda or topics to discuss..."
                placeholderTextColor={Colors.textLight}
                value={callData.notes}
                onChangeText={(text) =>
                  setCallData((prev) => ({ ...prev, notes: text }))
                }
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.scheduleButton,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleScheduleCall}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[Colors.secondary, '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Phone color={Colors.white} size={20} />
              <Text style={styles.scheduleButtonText}>
                {isLoading ? 'Scheduling...' : 'Schedule Call'}
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  safeArea: {
    flex: 1,
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
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  candidateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  candidateRole: {
    fontSize: 13,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  callTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  callTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  callTypeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  callTypePressed: {
    opacity: 0.7,
  },
  callTypeText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  callTypeTextSelected: {
    color: Colors.white,
  },
  dateScroll: {
    gap: 12,
    paddingRight: 20,
  },
  dateOption: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
  },
  dateSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  datePressed: {
    opacity: 0.7,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  dateTextSelected: {
    color: Colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timePressed: {
    opacity: 0.7,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  timeTextSelected: {
    color: Colors.white,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  durationOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  durationSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationPressed: {
    opacity: 0.7,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  durationTextSelected: {
    color: Colors.white,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  scheduleButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 12,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  scheduleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
