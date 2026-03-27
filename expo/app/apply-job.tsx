import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  Send,
  User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
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

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  resumeUri?: string;
  resumeName?: string;
}

interface ApplicationData {
  coverLetter: string;
  whyYou: string;
  availability: string;
  salaryExpectation: string;
  additionalInfo: string;
  customResumeUri?: string;
  customResumeName?: string;
}

export default function ApplyJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobTitle = params.jobTitle as string;
  const company = params.company as string;
  const jobId = params.jobId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
  });
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    coverLetter: '',
    whyYou: '',
    availability: '',
    salaryExpectation: '',
    additionalInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const progressAnim = useState(new Animated.Value(0.2))[0];

  const totalSteps = 5;

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: currentStep / totalSteps,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressAnim, totalSteps]);

  const loadProfileData = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        setProfileData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          resumeUri: userData.resumeUri,
          resumeName: userData.resumeName,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setApplicationData((prev) => ({
          ...prev,
          customResumeUri: file.uri,
          customResumeName: file.name,
        }));
        Alert.alert('Success', 'Resume uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      Alert.alert('Error', 'Failed to upload resume');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!profileData.fullName || !profileData.email || !profileData.phone) {
          Alert.alert('Required', 'Please fill in all contact information');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return false;
        }
        return true;
      case 2:
        if (!profileData.resumeUri && !applicationData.customResumeUri) {
          Alert.alert('Resume Required', 'Please upload your resume to continue');
          return false;
        }
        return true;
      case 3:
        if (!applicationData.coverLetter.trim()) {
          Alert.alert('Cover Letter Required', 'Please write a cover letter');
          return false;
        }
        if (applicationData.coverLetter.trim().length < 50) {
          Alert.alert(
            'Cover Letter Too Short',
            'Please write at least 50 characters'
          );
          return false;
        }
        return true;
      case 4:
        if (!applicationData.whyYou.trim()) {
          Alert.alert('Required', 'Please tell us why you are a good fit');
          return false;
        }
        if (!applicationData.availability.trim()) {
          Alert.alert('Required', 'Please specify your availability');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const application = {
        jobId,
        jobTitle,
        company,
        ...profileData,
        ...applicationData,
        submittedAt: new Date().toISOString(),
      };

      const stored = await AsyncStorage.getItem('applications');
      const applications = stored ? JSON.parse(stored) : [];
      applications.push(application);
      await AsyncStorage.setItem('applications', JSON.stringify(applications));

      console.log('Application submitted:', application);

      Alert.alert(
        'Application Submitted! 🎉',
        `Your application for ${jobTitle} at ${company} has been submitted successfully. The recruiter will review your application and get back to you soon.`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/jobs'),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <User color={Colors.primary} size={32} />
              <Text style={styles.stepTitle}>Contact Information</Text>
              <Text style={styles.stepDescription}>
                Let&apos;s start with your basic information
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor={Colors.textLight}
                  value={profileData.fullName}
                  onChangeText={(text) =>
                    setProfileData((prev) => ({ ...prev, fullName: text }))
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textLight}
                  value={profileData.email}
                  onChangeText={(text) =>
                    setProfileData((prev) => ({ ...prev, email: text }))
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="+233 24 123 4567"
                  placeholderTextColor={Colors.textLight}
                  value={profileData.phone}
                  onChangeText={(text) =>
                    setProfileData((prev) => ({ ...prev, phone: text }))
                  }
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <FileText color={Colors.primary} size={32} />
              <Text style={styles.stepTitle}>Resume/CV</Text>
              <Text style={styles.stepDescription}>
                Upload your latest resume or CV
              </Text>
            </View>

            {(profileData.resumeUri || applicationData.customResumeUri) && (
              <View style={styles.resumeCard}>
                <CheckCircle2 color={Colors.success} size={24} />
                <Text style={styles.resumeText}>
                  {applicationData.customResumeName ||
                    profileData.resumeName ||
                    'Resume uploaded'}
                </Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.uploadButton,
                pressed && styles.uploadButtonPressed,
              ]}
              onPress={handleUploadResume}
            >
              <FileText color={Colors.primary} size={24} />
              <Text style={styles.uploadButtonText}>
                {applicationData.customResumeUri || profileData.resumeUri
                  ? 'Upload Different Resume'
                  : 'Upload Resume'}
              </Text>
            </Pressable>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Accepted formats: PDF, DOC, DOCX{'\n'}
                Max size: 10MB
              </Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <FileText color={Colors.primary} size={32} />
              <Text style={styles.stepTitle}>Cover Letter</Text>
              <Text style={styles.stepDescription}>
                Tell the employer why you&apos;re interested in this role
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Cover Letter * (min. 50 characters)
              </Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my strong interest in the position..."
                  placeholderTextColor={Colors.textLight}
                  value={applicationData.coverLetter}
                  onChangeText={(text) =>
                    setApplicationData((prev) => ({ ...prev, coverLetter: text }))
                  }
                  multiline
                  numberOfLines={10}
                />
              </View>
              <Text style={styles.charCount}>
                {applicationData.coverLetter.length} characters
              </Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Briefcase color={Colors.primary} size={32} />
              <Text style={styles.stepTitle}>Additional Information</Text>
              <Text style={styles.stepDescription}>
                Help us understand your fit for this role
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Why are you a good fit for this role? *
              </Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your relevant skills and experience..."
                  placeholderTextColor={Colors.textLight}
                  value={applicationData.whyYou}
                  onChangeText={(text) =>
                    setApplicationData((prev) => ({ ...prev, whyYou: text }))
                  }
                  multiline
                  numberOfLines={5}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>When can you start? *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Immediately / 2 weeks notice / 1 month"
                  placeholderTextColor={Colors.textLight}
                  value={applicationData.availability}
                  onChangeText={(text) =>
                    setApplicationData((prev) => ({ ...prev, availability: text }))
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Salary Expectation (Optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="$50,000 - $60,000 per year"
                  placeholderTextColor={Colors.textLight}
                  value={applicationData.salaryExpectation}
                  onChangeText={(text) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      salaryExpectation: text,
                    }))
                  }
                />
              </View>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <CheckCircle2 color={Colors.success} size={32} />
              <Text style={styles.stepTitle}>Review & Submit</Text>
              <Text style={styles.stepDescription}>
                Review your application before submitting
              </Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Contact Information</Text>
              <Text style={styles.reviewText}>Name: {profileData.fullName}</Text>
              <Text style={styles.reviewText}>Email: {profileData.email}</Text>
              <Text style={styles.reviewText}>Phone: {profileData.phone}</Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Resume</Text>
              <Text style={styles.reviewText}>
                {applicationData.customResumeName ||
                  profileData.resumeName ||
                  'Uploaded'}
              </Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Cover Letter</Text>
              <Text style={styles.reviewText} numberOfLines={3}>
                {applicationData.coverLetter}
              </Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Availability</Text>
              <Text style={styles.reviewText}>
                {applicationData.availability}
              </Text>
            </View>

            {applicationData.salaryExpectation && (
              <View style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>Salary Expectation</Text>
                <Text style={styles.reviewText}>
                  {applicationData.salaryExpectation}
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Any additional information? (Optional)
              </Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add any additional information you'd like to share..."
                  placeholderTextColor={Colors.textLight}
                  value={applicationData.additionalInfo}
                  onChangeText={(text) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      additionalInfo: text,
                    }))
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
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
            onPress={handleBack}
          >
            <ArrowLeft color={Colors.text} size={24} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {jobTitle}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {company}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep < totalSteps ? (
            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleNext}
            >
              <LinearGradient
                colors={[Colors.primary, '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <ArrowRight color={Colors.white} size={20} />
              </LinearGradient>
            </Pressable>
          ) : (
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
                colors={[Colors.success, '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Send color={Colors.white} size={20} />
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
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
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    gap: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
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
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadButtonPressed: {
    opacity: 0.7,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  resumeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  infoBox: {
    backgroundColor: Colors.light,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 20,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
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
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
