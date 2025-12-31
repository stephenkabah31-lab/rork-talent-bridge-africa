import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  User,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import React, { useState } from 'react';
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

interface Application {
  jobId: string;
  jobTitle: string;
  company: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUri?: string;
  resumeName?: string;
  coverLetter: string;
  whyYou: string;
  availability: string;
  salaryExpectation?: string;
  additionalInfo?: string;
  submittedAt: string;
  status?: 'pending' | 'reviewing' | 'shortlisted' | 'rejected';
}

export default function ManageApplicationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string;
  const jobTitle = params.jobTitle as string;
  
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const { data: applications = [], refetch } = useQuery<Application[]>({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('applications');
      const allApplications: Application[] = stored ? JSON.parse(stored) : [];
      
      if (jobId) {
        return allApplications.filter((app) => app.jobId === jobId);
      }
      
      return allApplications;
    },
  });

  const handleUpdateStatus = async (
    application: Application,
    newStatus: 'reviewing' | 'shortlisted' | 'rejected'
  ) => {
    try {
      const stored = await AsyncStorage.getItem('applications');
      const allApplications: Application[] = stored ? JSON.parse(stored) : [];
      
      const updatedApplications = allApplications.map((app) => {
        if (
          app.jobId === application.jobId &&
          app.email === application.email &&
          app.submittedAt === application.submittedAt
        ) {
          return { ...app, status: newStatus };
        }
        return app;
      });
      
      await AsyncStorage.setItem('applications', JSON.stringify(updatedApplications));
      await refetch();
      
      const statusMessages = {
        reviewing: 'marked as under review',
        shortlisted: 'shortlisted',
        rejected: 'rejected',
      };
      
      Alert.alert('Status Updated', `Application ${statusMessages[newStatus]} successfully.`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update application status.');
    }
  };

  const handleScheduleInterview = (application: Application) => {
    router.push({
      pathname: '/schedule-call',
      params: {
        candidateName: application.fullName,
        jobTitle: application.jobTitle,
        candidateEmail: application.email,
      },
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'reviewing':
        return Colors.primary;
      case 'shortlisted':
        return Colors.success;
      case 'rejected':
        return '#EF4444';
      default:
        return Colors.textLight;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'reviewing':
        return 'Under Review';
      case 'shortlisted':
        return 'Shortlisted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'New';
    }
  };

  const getAppId = (app: Application) => {
    return `${app.email}-${app.submittedAt}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/jobs');
            }
          }}
        >
          <ArrowLeft color={Colors.text} size={24} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Applications</Text>
          <Text style={styles.headerSubtitle}>
            {jobTitle || 'All Jobs'}
          </Text>
        </View>
      </View>

      {applications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText color={Colors.textLight} size={64} />
          <Text style={styles.emptyTitle}>No Applications Yet</Text>
          <Text style={styles.emptySubtitle}>
            Applications for this job will appear here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.countText}>
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </Text>

          {applications.map((application) => {
            const appId = getAppId(application);
            const isExpanded = expandedAppId === appId;
            
            return (
              <View key={appId} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <View style={styles.applicantIcon}>
                    <User color={Colors.primary} size={24} />
                  </View>
                  <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{application.fullName}</Text>
                    <Text style={styles.applicantDate}>
                      Applied {new Date(application.submittedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(application.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(application.status) },
                      ]}
                    >
                      {getStatusText(application.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.contactInfo}>
                  <View style={styles.contactRow}>
                    <Mail color={Colors.textLight} size={16} />
                    <Text style={styles.contactText}>{application.email}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Phone color={Colors.textLight} size={16} />
                    <Text style={styles.contactText}>{application.phone}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Clock color={Colors.textLight} size={16} />
                    <Text style={styles.contactText}>
                      Available: {application.availability}
                    </Text>
                  </View>
                  {application.salaryExpectation && (
                    <View style={styles.contactRow}>
                      <Text style={styles.contactText}>
                        💰 {application.salaryExpectation}
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={() => setExpandedAppId(isExpanded ? null : appId)}
                  style={styles.expandToggle}
                >
                  <Text style={styles.expandText}>
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp color={Colors.primary} size={20} />
                  ) : (
                    <ChevronDown color={Colors.primary} size={20} />
                  )}
                </Pressable>

                {isExpanded && (
                  <View style={styles.detailsSection}>
                    <View style={styles.detailBlock}>
                      <Text style={styles.detailLabel}>Cover Letter</Text>
                      <Text style={styles.detailText}>
                        {application.coverLetter}
                      </Text>
                    </View>

                    <View style={styles.detailBlock}>
                      <Text style={styles.detailLabel}>Why This Candidate?</Text>
                      <Text style={styles.detailText}>{application.whyYou}</Text>
                    </View>

                    {application.additionalInfo && (
                      <View style={styles.detailBlock}>
                        <Text style={styles.detailLabel}>Additional Information</Text>
                        <Text style={styles.detailText}>
                          {application.additionalInfo}
                        </Text>
                      </View>
                    )}

                    {application.resumeName && (
                      <View style={styles.resumeInfo}>
                        <FileText color={Colors.success} size={20} />
                        <Text style={styles.resumeText}>
                          {application.resumeName}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.reviewButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => handleUpdateStatus(application, 'reviewing')}
                  >
                    <Eye color={Colors.primary} size={18} />
                    <Text style={styles.reviewButtonText}>Review</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.shortlistButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => handleUpdateStatus(application, 'shortlisted')}
                  >
                    <CheckCircle color={Colors.success} size={18} />
                    <Text style={styles.shortlistButtonText}>Shortlist</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.rejectButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => handleUpdateStatus(application, 'rejected')}
                  >
                    <XCircle color="#EF4444" size={18} />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.scheduleButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => handleScheduleInterview(application)}
                >
                  <LinearGradient
                    colors={[Colors.secondary, '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Calendar color={Colors.white} size={20} />
                    <Text style={styles.scheduleButtonText}>
                      Schedule Interview
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 16,
  },
  applicationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  applicantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  applicantDate: {
    fontSize: 13,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  contactInfo: {
    gap: 10,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 16,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  detailsSection: {
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailBlock: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  resumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  reviewButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  reviewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  shortlistButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  shortlistButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.success,
  },
  rejectButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  scheduleButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
