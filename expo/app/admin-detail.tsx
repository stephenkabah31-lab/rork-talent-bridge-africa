import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
  XCircle,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface ProfessionalApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  experience: string;
  skills: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface RecruiterApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface CompanyApplication {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  website: string;
  registrationNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedBy: string;
  applicants: number;
  status: 'active' | 'closed' | 'flagged';
  createdAt: string;
  description?: string;
  salary?: string;
  requirements?: string[];
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  title: string;
  appliedAt: string;
  status: 'pending' | 'shortlisted' | 'rejected';
}

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    title: 'Senior Developer',
    appliedAt: '2025-01-10T14:30:00Z',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    title: 'Full Stack Engineer',
    appliedAt: '2025-01-09T10:20:00Z',
    status: 'shortlisted',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@email.com',
    title: 'React Native Developer',
    appliedAt: '2025-01-08T16:45:00Z',
    status: 'pending',
  },
];

export default function AdminDetailScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const [data, setData] = useState<ProfessionalApplication | RecruiterApplication | CompanyApplication | JobPosting | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      let storageKey = '';
      
      switch (type) {
        case 'professional':
          storageKey = 'professionalApplications';
          break;
        case 'recruiter':
          storageKey = 'recruiterApplications';
          break;
        case 'company':
          storageKey = 'companyApplications';
          break;
        case 'job':
          storageKey = 'jobPostings';
          setApplicants(MOCK_APPLICANTS);
          break;
        default:
          return;
      }

      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const items = JSON.parse(stored);
        const item = items.find((i: { id: string }) => i.id === id);
        setData(item || null);
      }
    } catch (error) {
      console.error('Error loading detail data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!data || type === 'job') return;

    Alert.alert(
      'Approve Application',
      `Are you sure you want to approve this ${type} application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              let storageKey = '';
              switch (type) {
                case 'professional':
                  storageKey = 'professionalApplications';
                  break;
                case 'recruiter':
                  storageKey = 'recruiterApplications';
                  break;
                case 'company':
                  storageKey = 'companyApplications';
                  break;
              }

              const stored = await AsyncStorage.getItem(storageKey);
              if (stored) {
                const items = JSON.parse(stored);
                const updated = items.map((i: { id: string }) => 
                  i.id === id ? { ...i, status: 'approved' } : i
                );
                await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
                setData({ ...data, status: 'approved' } as typeof data);
                Alert.alert('Success', 'Application approved successfully');
              }
            } catch (error) {
              console.error('Error approving:', error);
              Alert.alert('Error', 'Failed to approve application');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!data || type === 'job') return;

    Alert.alert(
      'Reject Application',
      `Are you sure you want to reject this ${type} application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              let storageKey = '';
              switch (type) {
                case 'professional':
                  storageKey = 'professionalApplications';
                  break;
                case 'recruiter':
                  storageKey = 'recruiterApplications';
                  break;
                case 'company':
                  storageKey = 'companyApplications';
                  break;
              }

              const stored = await AsyncStorage.getItem(storageKey);
              if (stored) {
                const items = JSON.parse(stored);
                const updated = items.map((i: { id: string }) => 
                  i.id === id ? { ...i, status: 'rejected' } : i
                );
                await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
                setData({ ...data, status: 'rejected' } as typeof data);
                Alert.alert('Success', 'Application rejected');
              }
            } catch (error) {
              console.error('Error rejecting:', error);
              Alert.alert('Error', 'Failed to reject application');
            }
          },
        },
      ]
    );
  };

  const handleJobStatus = async (status: 'active' | 'closed' | 'flagged') => {
    if (!data || type !== 'job') return;

    try {
      const stored = await AsyncStorage.getItem('jobPostings');
      if (stored) {
        const items = JSON.parse(stored);
        const updated = items.map((i: { id: string }) => 
          i.id === id ? { ...i, status } : i
        );
        await AsyncStorage.setItem('jobPostings', JSON.stringify(updated));
        setData({ ...data, status } as typeof data);
        Alert.alert('Success', `Job status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !data) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark, Colors.darkLight]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const renderProfessionalDetail = () => {
    const professional = data as ProfessionalApplication;
    return (
      <View style={styles.detailContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircleLarge}>
            <User color={Colors.primary} size={32} />
          </View>
          <Text style={styles.detailName}>{professional.name}</Text>
          <Text style={styles.detailTitle}>{professional.title}</Text>
          
          <View style={[styles.statusBadge, {
            backgroundColor: professional.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                           professional.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                           'rgba(245, 158, 11, 0.2)',
          }]}>
            <Text style={[styles.statusText, {
              color: professional.status === 'approved' ? Colors.success :
                     professional.status === 'rejected' ? Colors.error :
                     '#F59E0B',
            }]}>
              {professional.status.charAt(0).toUpperCase() + professional.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <Mail color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{professional.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{professional.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{professional.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Briefcase color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{professional.experience}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Applied On</Text>
              <Text style={styles.infoValue}>{formatDate(professional.createdAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {professional.skills.map((skill, idx) => (
              <View key={idx} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {professional.status === 'pending' && (
          <View style={styles.actionsSection}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.rejectButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleReject}
            >
              <XCircle color={Colors.white} size={20} />
              <Text style={styles.actionButtonText}>Reject</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.approveButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleApprove}
            >
              <CheckCircle color={Colors.white} size={20} />
              <Text style={styles.actionButtonText}>Approve</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderRecruiterDetail = () => {
    const recruiter = data as RecruiterApplication;
    return (
      <View style={styles.detailContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircleLarge}>
            <Users color={Colors.success} size={32} />
          </View>
          <Text style={styles.detailName}>{recruiter.name}</Text>
          <Text style={styles.detailTitle}>{recruiter.company}</Text>
          
          <View style={[styles.statusBadge, {
            backgroundColor: recruiter.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                           recruiter.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                           'rgba(245, 158, 11, 0.2)',
          }]}>
            <Text style={[styles.statusText, {
              color: recruiter.status === 'approved' ? Colors.success :
                     recruiter.status === 'rejected' ? Colors.error :
                     '#F59E0B',
            }]}>
              {recruiter.status.charAt(0).toUpperCase() + recruiter.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <Mail color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{recruiter.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{recruiter.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{recruiter.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Building2 color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Company</Text>
              <Text style={styles.infoValue}>{recruiter.company}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Applied On</Text>
              <Text style={styles.infoValue}>{formatDate(recruiter.createdAt)}</Text>
            </View>
          </View>
        </View>

        {recruiter.status === 'pending' && (
          <View style={styles.actionsSection}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.rejectButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleReject}
            >
              <XCircle color={Colors.white} size={20} />
              <Text style={styles.actionButtonText}>Reject</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.approveButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleApprove}
            >
              <CheckCircle color={Colors.white} size={20} />
              <Text style={styles.actionButtonText}>Approve</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderCompanyDetail = () => {
    const company = data as CompanyApplication;
    return (
      <View style={styles.detailContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircleLarge}>
            <Building2 color="#F59E0B" size={32} />
          </View>
          <Text style={styles.detailName}>{company.companyName}</Text>
          <Text style={styles.detailTitle}>{company.industry}</Text>
          
          <View style={[styles.statusBadge, {
            backgroundColor: company.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                           company.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                           'rgba(245, 158, 11, 0.2)',
          }]}>
            <Text style={[styles.statusText, {
              color: company.status === 'approved' ? Colors.success :
                     company.status === 'rejected' ? Colors.error :
                     '#F59E0B',
            }]}>
              {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          
          <View style={styles.infoRow}>
            <User color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contact Person</Text>
              <Text style={styles.infoValue}>{company.contactPerson}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{company.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{company.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{company.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Globe color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Website</Text>
              <Text style={styles.infoValue}>{company.website}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <FileText color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Registration Number</Text>
              <Text style={styles.infoValue}>{company.registrationNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Applied On</Text>
              <Text style={styles.infoValue}>{formatDate(company.createdAt)}</Text>
            </View>
          </View>
        </View>

        {company.status === 'pending' && (
          <View style={styles.actionsSection}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.rejectButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleReject}
            >
              <XCircle color={Colors.white} size={20} />
              <Text style={styles.actionButtonText}>Reject</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.approveButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleApprove}
            >
              <CheckCircle color={Colors.white} size={20} />
              <Text style={styles.actionButtonText}>Approve</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderJobDetail = () => {
    const job = data as JobPosting;
    return (
      <View style={styles.detailContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircleLarge}>
            <Briefcase color="#8B5CF6" size={32} />
          </View>
          <Text style={styles.detailName}>{job.title}</Text>
          <Text style={styles.detailTitle}>{job.company}</Text>
          
          <View style={[styles.statusBadge, {
            backgroundColor: job.status === 'active' ? 'rgba(16, 185, 129, 0.2)' :
                           job.status === 'closed' ? 'rgba(107, 114, 128, 0.2)' :
                           'rgba(239, 68, 68, 0.2)',
          }]}>
            <Text style={[styles.statusText, {
              color: job.status === 'active' ? Colors.success :
                     job.status === 'closed' ? Colors.textLight :
                     Colors.error,
            }]}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Job Information</Text>
          
          <View style={styles.infoRow}>
            <MapPin color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{job.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Clock color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{job.type}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <User color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Posted By</Text>
              <Text style={styles.infoValue}>{job.postedBy}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Users color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Applicants</Text>
              <Text style={styles.infoValue}>{job.applicants} candidates</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar color={Colors.textLight} size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Posted On</Text>
              <Text style={styles.infoValue}>{formatDate(job.createdAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Applicants ({applicants.length})</Text>
          {applicants.map((applicant) => (
            <View key={applicant.id} style={styles.applicantCard}>
              <View style={styles.applicantHeader}>
                <View style={styles.applicantIcon}>
                  <User color={Colors.primary} size={20} />
                </View>
                <View style={styles.applicantInfo}>
                  <Text style={styles.applicantName}>{applicant.name}</Text>
                  <Text style={styles.applicantTitle}>{applicant.title}</Text>
                  <Text style={styles.applicantDate}>{formatDate(applicant.appliedAt)}</Text>
                </View>
                <View style={[styles.applicantStatusBadge, {
                  backgroundColor: applicant.status === 'shortlisted' ? 'rgba(16, 185, 129, 0.15)' :
                                 applicant.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' :
                                 'rgba(245, 158, 11, 0.15)',
                }]}>
                  <Text style={[styles.applicantStatusText, {
                    color: applicant.status === 'shortlisted' ? Colors.success :
                           applicant.status === 'rejected' ? Colors.error :
                           '#F59E0B',
                  }]}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionsSection}>
          {job.status === 'active' && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.warningButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={() => handleJobStatus('closed')}
            >
              <XCircle color={Colors.white} size={20} />
              <Text style={styles.actionButtonText}>Close Job</Text>
            </Pressable>
          )}
          {job.status === 'closed' && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.approveButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={() => handleJobStatus('active')}
            >
              <CheckCircle color={Colors.white} size={20} />
              <Text style={styles.actionButtonText}>Reopen Job</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.rejectButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => handleJobStatus('flagged')}
          >
            <Shield color={Colors.white} size={20} />
            <Text style={styles.actionButtonText}>Flag</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: Colors.white,
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark, Colors.darkLight]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {type === 'professional' && renderProfessionalDetail()}
            {type === 'recruiter' && renderRecruiterDetail()}
            {type === 'company' && renderCompanyDetail()}
            {type === 'job' && renderJobDetail()}
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.white,
  },
  detailContainer: {
    gap: 24,
  },
  headerSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailName: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailTitle: {
    fontSize: 16,
    color: Colors.light,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  skillText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#93C5FD',
  },
  applicantCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applicantIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 2,
  },
  applicantTitle: {
    fontSize: 13,
    color: Colors.light,
    marginBottom: 2,
  },
  applicantDate: {
    fontSize: 11,
    color: Colors.textLight,
  },
  applicantStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  applicantStatusText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  warningButton: {
    backgroundColor: '#6B7280',
  },
  actionButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
