import {
  Briefcase,
  MapPin,
  MessageCircle,
  UserPlus,
  GraduationCap,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

export default function UserProfileScreen() {

  const profileData = {
    name: 'Sarah Johnson',
    title: 'Senior Recruiter at Tech Africa',
    location: 'Nairobi, Kenya',
    email: 'sarah.johnson@techafrica.com',
    connections: 1243,
    about:
      'Passionate about connecting African tech talent with amazing opportunities. 10+ years in recruitment and talent acquisition. Building the future of work in Africa.',
    experience: [
      {
        id: '1',
        title: 'Senior Recruiter',
        company: 'Tech Africa',
        duration: '2020 - Present',
        description: 'Leading technical recruitment across East Africa',
      },
      {
        id: '2',
        title: 'Talent Acquisition Manager',
        company: 'Innovation Hub',
        duration: '2017 - 2020',
        description: 'Built and managed recruitment team',
      },
    ],
    education: [
      {
        id: '1',
        degree: 'MBA in Human Resources',
        school: 'University of Nairobi',
        year: '2016',
      },
    ],
    skills: ['Technical Recruitment', 'Talent Acquisition', 'HR Strategy', 'Team Building'],
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.coverPhoto} />
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profileData.name.charAt(0)}</Text>
              </View>
            </View>

            <View style={styles.nameSection}>
              <Text style={styles.name}>{profileData.name}</Text>
              <Text style={styles.title}>{profileData.title}</Text>
              <View style={styles.locationRow}>
                <MapPin color={Colors.textLight} size={16} />
                <Text style={styles.location}>{profileData.location}</Text>
              </View>
              <Text style={styles.connections}>{profileData.connections} connections</Text>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.primaryButton}>
                <UserPlus color={Colors.white} size={20} />
                <Text style={styles.primaryButtonText}>Connect</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton}>
                <MessageCircle color={Colors.primary} size={20} />
                <Text style={styles.secondaryButtonText}>Message</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{profileData.about}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {profileData.experience.map((exp) => (
            <View key={exp.id} style={styles.experienceItem}>
              <View style={styles.iconContainer}>
                <Briefcase color={Colors.primary} size={20} />
              </View>
              <View style={styles.experienceContent}>
                <Text style={styles.experienceTitle}>{exp.title}</Text>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                <Text style={styles.experienceDuration}>{exp.duration}</Text>
                <Text style={styles.experienceDescription}>{exp.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {profileData.education.map((edu) => (
            <View key={edu.id} style={styles.educationItem}>
              <View style={styles.iconContainer}>
                <GraduationCap color={Colors.secondary} size={20} />
              </View>
              <View style={styles.educationContent}>
                <Text style={styles.educationDegree}>{edu.degree}</Text>
                <Text style={styles.educationSchool}>{edu.school}</Text>
                <Text style={styles.educationYear}>{edu.year}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {profileData.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  coverPhoto: {
    height: 120,
    backgroundColor: Colors.primary,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarContainer: {
    marginTop: -40,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
  },
  nameSection: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.textLight,
  },
  connections: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  experienceItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceContent: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 2,
  },
  experienceDuration: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  educationItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  educationContent: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  educationSchool: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 2,
  },
  educationYear: {
    fontSize: 13,
    color: Colors.textLight,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
