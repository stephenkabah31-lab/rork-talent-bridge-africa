import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Award,
  Briefcase,
  Camera,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Upload,
  User,
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

interface JobHistory {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  currentlyStudying: boolean;
}

interface Skill {
  id: string;
  name: string;
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  profession: string;
  yearsExperience: string;
  bio: string;
  profilePicture?: string;
  resumeUri?: string;
  resumeName?: string;
  jobHistory: JobHistory[];
  education: Education[];
  skills: Skill[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    profession: '',
    yearsExperience: '',
    bio: '',
    jobHistory: [],
    education: [],
    skills: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [currentJob, setCurrentJob] = useState<JobHistory>({
    id: '',
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
  });

  const [currentEducation, setCurrentEducation] = useState<Education>({
    id: '',
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    currentlyStudying: false,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        setProfileData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          profession: userData.profession || '',
          yearsExperience: userData.yearsExperience || '',
          bio: userData.bio || '',
          profilePicture: userData.profilePicture,
          resumeUri: userData.resumeUri,
          resumeName: userData.resumeName,
          jobHistory: userData.jobHistory || [],
          education: userData.education || [],
          skills: userData.skills || [],
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.fullName || !profileData.email || !profileData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        const updatedUser = {
          ...userData,
          ...profileData,
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setProfileData((prev) => ({
          ...prev,
          profilePicture: imageUri,
        }));
        console.log('Profile picture updated:', imageUri);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    }
  };

  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setProfileData((prev) => ({
          ...prev,
          resumeUri: file.uri,
          resumeName: file.name,
        }));
        Alert.alert('Success', 'Resume uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      Alert.alert('Error', 'Failed to upload resume');
    }
  };

  const handleAddJob = () => {
    if (!currentJob.jobTitle || !currentJob.company) {
      Alert.alert('Error', 'Please fill in job title and company');
      return;
    }

    const newJob = {
      ...currentJob,
      id: Date.now().toString(),
    };

    setProfileData((prev) => ({
      ...prev,
      jobHistory: [...prev.jobHistory, newJob],
    }));

    setCurrentJob({
      id: '',
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
    });
    setShowJobForm(false);
  };

  const handleRemoveJob = (id: string) => {
    setProfileData((prev) => ({
      ...prev,
      jobHistory: prev.jobHistory.filter((job) => job.id !== id),
    }));
  };

  const handleAddEducation = () => {
    if (!currentEducation.institution || !currentEducation.degree) {
      Alert.alert('Error', 'Please fill in institution and degree');
      return;
    }

    const newEducation = {
      ...currentEducation,
      id: Date.now().toString(),
    };

    setProfileData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));

    setCurrentEducation({
      id: '',
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      currentlyStudying: false,
    });
    setShowEducationForm(false);
  };

  const handleRemoveEducation = (id: string) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;

    setProfileData((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now().toString(), name: newSkill.trim() }],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (id: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profilePictureSection}>
              <Pressable
                style={({ pressed }) => [
                  styles.profilePictureContainer,
                  pressed && styles.profilePicturePressed,
                ]}
                onPress={handleUploadProfilePicture}
              >
                {profileData.profilePicture ? (
                  <Image
                    source={{ uri: profileData.profilePicture }}
                    style={styles.profilePicture}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <User color={Colors.textLight} size={48} />
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Camera color={Colors.white} size={18} />
                </View>
              </Pressable>
              <Text style={styles.profilePictureLabel}>Profile Picture</Text>
              <Text style={styles.profilePictureSubtext}>Tap to change</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <User color={Colors.textLight} size={20} />
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
                  <Mail color={Colors.textLight} size={20} />
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
                <Text style={styles.label}>Phone *</Text>
                <View style={styles.inputContainer}>
                  <Phone color={Colors.textLight} size={20} />
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputContainer}>
                  <MapPin color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="City, Country"
                    placeholderTextColor={Colors.textLight}
                    value={profileData.location}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({ ...prev, location: text }))
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profession</Text>
                <View style={styles.inputContainer}>
                  <Briefcase color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your profession"
                    placeholderTextColor={Colors.textLight}
                    value={profileData.profession}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({ ...prev, profession: text }))
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Years of Experience</Text>
                <View style={styles.inputContainer}>
                  <Award color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="5"
                    placeholderTextColor={Colors.textLight}
                    value={profileData.yearsExperience}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({ ...prev, yearsExperience: text }))
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor={Colors.textLight}
                    value={profileData.bio}
                    onChangeText={(text) =>
                      setProfileData((prev) => ({ ...prev, bio: text }))
                    }
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resume/CV</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.uploadButton,
                  pressed && styles.uploadButtonPressed,
                ]}
                onPress={handleUploadResume}
              >
                <Upload color={Colors.primary} size={24} />
                <View style={styles.uploadContent}>
                  <Text style={styles.uploadTitle}>
                    {profileData.resumeName ? profileData.resumeName : 'Upload Resume/CV'}
                  </Text>
                  <Text style={styles.uploadSubtitle}>PDF or Word document</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Work Experience</Text>
                <Pressable
                  style={styles.addButton}
                  onPress={() => setShowJobForm(!showJobForm)}
                >
                  <Plus color={Colors.primary} size={20} />
                </Pressable>
              </View>

              {showJobForm && (
                <View style={styles.formCard}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Job Title *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Software Engineer"
                        placeholderTextColor={Colors.textLight}
                        value={currentJob.jobTitle}
                        onChangeText={(text) =>
                          setCurrentJob((prev) => ({ ...prev, jobTitle: text }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Company *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Company Name"
                        placeholderTextColor={Colors.textLight}
                        value={currentJob.company}
                        onChangeText={(text) =>
                          setCurrentJob((prev) => ({ ...prev, company: text }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="City, Country"
                        placeholderTextColor={Colors.textLight}
                        value={currentJob.location}
                        onChangeText={(text) =>
                          setCurrentJob((prev) => ({ ...prev, location: text }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Start Date</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/YYYY"
                          placeholderTextColor={Colors.textLight}
                          value={currentJob.startDate}
                          onChangeText={(text) =>
                            setCurrentJob((prev) => ({ ...prev, startDate: text }))
                          }
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.label}>End Date</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/YYYY"
                          placeholderTextColor={Colors.textLight}
                          value={currentJob.endDate}
                          onChangeText={(text) =>
                            setCurrentJob((prev) => ({ ...prev, endDate: text }))
                          }
                          editable={!currentJob.currentlyWorking}
                        />
                      </View>
                    </View>
                  </View>

                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() =>
                      setCurrentJob((prev) => ({
                        ...prev,
                        currentlyWorking: !prev.currentlyWorking,
                        endDate: !prev.currentlyWorking ? 'Present' : '',
                      }))
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        currentJob.currentlyWorking && styles.checkboxChecked,
                      ]}
                    >
                      {currentJob.currentlyWorking && (
                        <View style={styles.checkboxInner} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Currently working here</Text>
                  </Pressable>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your role and achievements..."
                        placeholderTextColor={Colors.textLight}
                        value={currentJob.description}
                        onChangeText={(text) =>
                          setCurrentJob((prev) => ({ ...prev, description: text }))
                        }
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </View>

                  <View style={styles.formActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.cancelButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => setShowJobForm(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.saveButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={handleAddJob}
                    >
                      <Text style={styles.saveButtonText}>Add</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {profileData.jobHistory.map((job) => (
                <View key={job.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Briefcase color={Colors.primary} size={20} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{job.jobTitle}</Text>
                      <Text style={styles.itemSubtitle}>{job.company}</Text>
                      {job.location && (
                        <Text style={styles.itemDetail}>{job.location}</Text>
                      )}
                      <Text style={styles.itemDetail}>
                        {job.startDate} - {job.currentlyWorking ? 'Present' : job.endDate}
                      </Text>
                      {job.description && (
                        <Text style={styles.itemDescription}>{job.description}</Text>
                      )}
                    </View>
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => handleRemoveJob(job.id)}
                    >
                      <Trash2 color={Colors.error} size={18} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Education</Text>
                <Pressable
                  style={styles.addButton}
                  onPress={() => setShowEducationForm(!showEducationForm)}
                >
                  <Plus color={Colors.primary} size={20} />
                </Pressable>
              </View>

              {showEducationForm && (
                <View style={styles.formCard}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Institution *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="University Name"
                        placeholderTextColor={Colors.textLight}
                        value={currentEducation.institution}
                        onChangeText={(text) =>
                          setCurrentEducation((prev) => ({ ...prev, institution: text }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Degree *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Bachelor's Degree"
                        placeholderTextColor={Colors.textLight}
                        value={currentEducation.degree}
                        onChangeText={(text) =>
                          setCurrentEducation((prev) => ({ ...prev, degree: text }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Field of Study</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Computer Science"
                        placeholderTextColor={Colors.textLight}
                        value={currentEducation.fieldOfStudy}
                        onChangeText={(text) =>
                          setCurrentEducation((prev) => ({ ...prev, fieldOfStudy: text }))
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Start Date</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/YYYY"
                          placeholderTextColor={Colors.textLight}
                          value={currentEducation.startDate}
                          onChangeText={(text) =>
                            setCurrentEducation((prev) => ({ ...prev, startDate: text }))
                          }
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.label}>End Date</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="MM/YYYY"
                          placeholderTextColor={Colors.textLight}
                          value={currentEducation.endDate}
                          onChangeText={(text) =>
                            setCurrentEducation((prev) => ({ ...prev, endDate: text }))
                          }
                          editable={!currentEducation.currentlyStudying}
                        />
                      </View>
                    </View>
                  </View>

                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() =>
                      setCurrentEducation((prev) => ({
                        ...prev,
                        currentlyStudying: !prev.currentlyStudying,
                        endDate: !prev.currentlyStudying ? 'Present' : '',
                      }))
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        currentEducation.currentlyStudying && styles.checkboxChecked,
                      ]}
                    >
                      {currentEducation.currentlyStudying && (
                        <View style={styles.checkboxInner} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>Currently studying</Text>
                  </Pressable>

                  <View style={styles.formActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.cancelButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => setShowEducationForm(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.saveButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={handleAddEducation}
                    >
                      <Text style={styles.saveButtonText}>Add</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {profileData.education.map((edu) => (
                <View key={edu.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <GraduationCap color={Colors.secondary} size={20} />
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{edu.degree}</Text>
                      <Text style={styles.itemSubtitle}>{edu.institution}</Text>
                      {edu.fieldOfStudy && (
                        <Text style={styles.itemDetail}>{edu.fieldOfStudy}</Text>
                      )}
                      <Text style={styles.itemDetail}>
                        {edu.startDate} - {edu.currentlyStudying ? 'Present' : edu.endDate}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => handleRemoveEducation(edu.id)}
                    >
                      <Trash2 color={Colors.error} size={18} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsInputContainer}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Add a skill"
                    placeholderTextColor={Colors.textLight}
                    value={newSkill}
                    onChangeText={setNewSkill}
                    onSubmitEditing={handleAddSkill}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.skillAddButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleAddSkill}
                >
                  <Plus color={Colors.white} size={20} />
                </Pressable>
              </View>

              <View style={styles.skillsContainer}>
                {profileData.skills.map((skill) => (
                  <View key={skill.id} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill.name}</Text>
                    <Pressable onPress={() => handleRemoveSkill(skill.id)}>
                      <Trash2 color={Colors.primary} size={14} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Saving...' : 'Save Profile'}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadButtonPressed: {
    opacity: 0.7,
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillsInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  skillAddButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 16,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    borderWidth: 4,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light,
  },
  profilePicturePressed: {
    opacity: 0.8,
  },
  profilePictureLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  profilePictureSubtext: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
