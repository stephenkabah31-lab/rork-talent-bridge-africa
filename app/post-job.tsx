import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  DollarSign,
  FileText,
  MapPin,
  Send,
} from 'lucide-react-native';
import React, { useState } from 'react';
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

interface JobPostData {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  benefits: string;
}

export default function PostJobScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<JobPostData>({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    responsibilities: '',
    qualifications: '',
    benefits: '',
  });

  const validateForm = (): boolean => {
    if (!jobData.title.trim()) {
      Alert.alert('Required', 'Please enter a job title');
      return false;
    }
    if (!jobData.company.trim()) {
      Alert.alert('Required', 'Please enter company name');
      return false;
    }
    if (!jobData.location.trim()) {
      Alert.alert('Required', 'Please enter job location');
      return false;
    }
    if (!jobData.salary.trim()) {
      Alert.alert('Required', 'Please enter salary range');
      return false;
    }
    if (!jobData.description.trim()) {
      Alert.alert('Required', 'Please enter job description');
      return false;
    }
    if (jobData.description.trim().length < 100) {
      Alert.alert(
        'Description Too Short',
        'Please write at least 100 characters for the job description'
      );
      return false;
    }
    if (!jobData.responsibilities.trim()) {
      Alert.alert('Required', 'Please enter key responsibilities');
      return false;
    }
    if (!jobData.qualifications.trim()) {
      Alert.alert('Required', 'Please enter required qualifications');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await AsyncStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;

      const job = {
        ...jobData,
        id: Date.now().toString(),
        postedDate: new Date().toISOString(),
        recruiterName: userData?.fullName || userData?.companyName || 'Anonymous',
        isVerified: userData?.companyVerified || false,
      };

      const stored = await AsyncStorage.getItem('postedJobs');
      const postedJobs = stored ? JSON.parse(stored) : [];
      postedJobs.push(job);
      await AsyncStorage.setItem('postedJobs', JSON.stringify(postedJobs));

      console.log('Job posted:', job);

      Alert.alert(
        'Job Posted Successfully! 🎉',
        `Your job posting for ${jobData.title} has been published. Qualified candidates will start applying soon.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/jobs'),
          },
        ]
      );
    } catch (error) {
      console.error('Error posting job:', error);
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Post a Job</Text>
            <Text style={styles.headerSubtitle}>
              Find the perfect candidate
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Briefcase color={Colors.primary} size={24} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Senior Software Engineer"
                placeholderTextColor={Colors.textLight}
                value={jobData.title}
                onChangeText={(text) =>
                  setJobData((prev) => ({ ...prev, title: text }))
                }
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <View style={styles.inputContainer}>
              <Building2 color={Colors.textLight} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Company name"
                placeholderTextColor={Colors.textLight}
                value={jobData.company}
                onChangeText={(text) =>
                  setJobData((prev) => ({ ...prev, company: text }))
                }
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.inputContainer}>
              <MapPin color={Colors.textLight} size={20} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Accra, Ghana"
                placeholderTextColor={Colors.textLight}
                value={jobData.location}
                onChangeText={(text) =>
                  setJobData((prev) => ({ ...prev, location: text }))
                }
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salary Range *</Text>
            <View style={styles.inputContainer}>
              <DollarSign color={Colors.textLight} size={20} />
              <TextInput
                style={styles.input}
                placeholder="e.g. $50,000 - $80,000"
                placeholderTextColor={Colors.textLight}
                value={jobData.salary}
                onChangeText={(text) =>
                  setJobData((prev) => ({ ...prev, salary: text }))
                }
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Type *</Text>
            <View style={styles.typeOptions}>
              {['Full-time', 'Part-time', 'Contract', 'Freelance'].map(
                (type) => (
                  <Pressable
                    key={type}
                    style={({ pressed }) => [
                      styles.typeOption,
                      jobData.type === type && styles.typeOptionSelected,
                      pressed && styles.typeOptionPressed,
                    ]}
                    onPress={() =>
                      setJobData((prev) => ({ ...prev, type }))
                    }
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        jobData.type === type && styles.typeOptionTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <FileText color={Colors.primary} size={24} />
            <Text style={styles.sectionTitle}>Job Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Job Description * (min. 100 characters)
            </Text>
            <Text style={styles.hint}>
              Describe the role, company culture, and what makes this
              opportunity unique
            </Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write a compelling description that will attract the right candidates..."
                placeholderTextColor={Colors.textLight}
                value={jobData.description}
                onChangeText={(text) =>
                  setJobData((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={8}
              />
            </View>
            <Text style={styles.charCount}>
              {jobData.description.length} characters
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Key Responsibilities *</Text>
            <Text style={styles.hint}>
              List the main duties and expectations (use bullet points with •)
            </Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={'• Design and develop software solutions\n• Collaborate with cross-functional teams\n• Lead technical discussions'}
                placeholderTextColor={Colors.textLight}
                value={jobData.responsibilities}
                onChangeText={(text) =>
                  setJobData((prev) => ({ ...prev, responsibilities: text }))
                }
                multiline
                numberOfLines={6}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Required Qualifications *</Text>
            <Text style={styles.hint}>
              List required skills, experience, and education
            </Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={'• 5+ years of experience\n• Bachelor\'s degree in Computer Science\n• Strong knowledge of React and TypeScript'}
                placeholderTextColor={Colors.textLight}
                value={jobData.qualifications}
                onChangeText={(text) =>
                  setJobData((prev) => ({ ...prev, qualifications: text }))
                }
                multiline
                numberOfLines={6}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Benefits & Perks (Optional)</Text>
            <Text style={styles.hint}>
              Highlight what makes your offer attractive
            </Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={'• Health insurance\n• Remote work options\n• Professional development budget\n• Flexible hours'}
                placeholderTextColor={Colors.textLight}
                value={jobData.benefits}
                onChangeText={(text) =>
                  setJobData((prev) => ({ ...prev, benefits: text }))
                }
                multiline
                numberOfLines={5}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Tip: Jobs with detailed descriptions receive 3x more
              applications. Be specific about requirements and benefits.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={[Colors.primary, '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Send color={Colors.white} size={20} />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Publishing...' : 'Publish Job'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionPressed: {
    opacity: 0.7,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  typeOptionTextSelected: {
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
