import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import {
  Activity,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
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

type TabType = 'overview' | 'professionals' | 'recruiters' | 'companies' | 'jobs' | 'users';

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
}

const MOCK_PROFESSIONALS: ProfessionalApplication[] = [
  {
    id: '1',
    name: 'Amara Okonkwo',
    email: 'amara.okonkwo@email.com',
    phone: '+234 80 123 4567',
    location: 'Lagos, Nigeria',
    title: 'Senior Software Engineer',
    experience: '8 years',
    skills: ['React Native', 'TypeScript', 'Node.js', 'AWS'],
    status: 'pending',
    createdAt: '2025-01-12T10:30:00Z',
  },
  {
    id: '2',
    name: 'Kwame Mensah',
    email: 'kwame.mensah@email.com',
    phone: '+233 24 555 1234',
    location: 'Accra, Ghana',
    title: 'Product Designer',
    experience: '5 years',
    skills: ['UI/UX', 'Figma', 'Prototyping', 'Design Systems'],
    status: 'pending',
    createdAt: '2025-01-11T14:20:00Z',
  },
  {
    id: '3',
    name: 'Sarah Kimani',
    email: 'sarah.kimani@email.com',
    phone: '+254 70 555 9012',
    location: 'Nairobi, Kenya',
    title: 'Data Scientist',
    experience: '6 years',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    status: 'approved',
    createdAt: '2025-01-10T09:15:00Z',
  },
];

const MOCK_RECRUITERS: RecruiterApplication[] = [
  {
    id: '1',
    name: 'John Osei',
    email: 'john.osei@techcorp.com',
    phone: '+233 24 777 8888',
    company: 'TechCorp Africa',
    location: 'Accra, Ghana',
    status: 'pending',
    createdAt: '2025-01-11T11:30:00Z',
  },
  {
    id: '2',
    name: 'Grace Mwangi',
    email: 'grace.m@innovate.co.ke',
    phone: '+254 70 888 9999',
    company: 'Innovate Kenya',
    location: 'Nairobi, Kenya',
    status: 'pending',
    createdAt: '2025-01-10T15:45:00Z',
  },
];

const MOCK_COMPANIES: CompanyApplication[] = [
  {
    id: '1',
    companyName: 'Tech Africa Solutions',
    contactPerson: 'Kwame Mensah',
    email: 'hr@techafricasolutions.com',
    phone: '+233 24 555 1234',
    location: 'Accra, Ghana',
    industry: 'Technology',
    website: 'www.techafricasolutions.com',
    registrationNumber: 'BN20231234',
    status: 'pending',
    createdAt: '2025-01-10T10:30:00Z',
  },
  {
    id: '2',
    companyName: 'AfriBank Financial',
    contactPerson: 'Amara Okafor',
    email: 'recruitment@afribank.com',
    phone: '+234 80 555 5678',
    location: 'Lagos, Nigeria',
    industry: 'Finance',
    website: 'www.afribank.com',
    registrationNumber: 'RC45678',
    status: 'pending',
    createdAt: '2025-01-11T14:20:00Z',
  },
];

const MOCK_JOBS: JobPosting[] = [
  {
    id: '1',
    title: 'Senior React Native Developer',
    company: 'Tech Africa Solutions',
    location: 'Accra, Ghana',
    type: 'Full-time',
    postedBy: 'Kwame Mensah',
    applicants: 24,
    status: 'active',
    createdAt: '2025-01-08T10:00:00Z',
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Innovate Kenya',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    postedBy: 'Grace Mwangi',
    applicants: 18,
    status: 'active',
    createdAt: '2025-01-09T14:30:00Z',
  },
];

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [professionals, setProfessionals] = useState<ProfessionalApplication[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterApplication[]>([]);
  const [companies, setCompanies] = useState<CompanyApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedProfessionals = await AsyncStorage.getItem('professionalApplications');
      const storedRecruiters = await AsyncStorage.getItem('recruiterApplications');
      const storedCompanies = await AsyncStorage.getItem('companyApplications');
      const storedJobs = await AsyncStorage.getItem('jobPostings');

      setProfessionals(storedProfessionals ? JSON.parse(storedProfessionals) : MOCK_PROFESSIONALS);
      setRecruiters(storedRecruiters ? JSON.parse(storedRecruiters) : MOCK_RECRUITERS);
      setCompanies(storedCompanies ? JSON.parse(storedCompanies) : MOCK_COMPANIES);
      setJobs(storedJobs ? JSON.parse(storedJobs) : MOCK_JOBS);

      if (!storedProfessionals) await AsyncStorage.setItem('professionalApplications', JSON.stringify(MOCK_PROFESSIONALS));
      if (!storedRecruiters) await AsyncStorage.setItem('recruiterApplications', JSON.stringify(MOCK_RECRUITERS));
      if (!storedCompanies) await AsyncStorage.setItem('companyApplications', JSON.stringify(MOCK_COMPANIES));
      if (!storedJobs) await AsyncStorage.setItem('jobPostings', JSON.stringify(MOCK_JOBS));
    } catch (error) {
      console.error('Error loading data:', error);
      setProfessionals(MOCK_PROFESSIONALS);
      setRecruiters(MOCK_RECRUITERS);
      setCompanies(MOCK_COMPANIES);
      setJobs(MOCK_JOBS);
    }
  };

  const handleApproveApplication = async (
    type: 'professional' | 'recruiter' | 'company',
    id: string,
    action: 'approved' | 'rejected'
  ) => {
    const actionText = action === 'approved' ? 'approve' : 'reject';
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Application`,
      `Are you sure you want to ${actionText} this application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approved' ? 'Approve' : 'Reject',
          style: action === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              let updated;
              let key;

              if (type === 'professional') {
                updated = professionals.map(p => p.id === id ? { ...p, status: action } : p);
                setProfessionals(updated);
                key = 'professionalApplications';
              } else if (type === 'recruiter') {
                updated = recruiters.map(r => r.id === id ? { ...r, status: action } : r);
                setRecruiters(updated);
                key = 'recruiterApplications';
              } else {
                updated = companies.map(c => c.id === id ? { ...c, status: action } : c);
                setCompanies(updated);
                key = 'companyApplications';
              }

              await AsyncStorage.setItem(key, JSON.stringify(updated));
              Alert.alert('Success', `Application has been ${action}.`);
            } catch (error) {
              console.error('Error updating application:', error);
              Alert.alert('Error', 'Failed to update application status');
            }
          },
        },
      ]
    );
  };

  const handleJobStatus = async (jobId: string, status: 'active' | 'closed' | 'flagged') => {
    try {
      const updated = jobs.map(j => j.id === jobId ? { ...j, status } : j);
      setJobs(updated);
      await AsyncStorage.setItem('jobPostings', JSON.stringify(updated));
      Alert.alert('Success', `Job status updated to ${status}.`);
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const pendingProfessionals = professionals.filter(p => p.status === 'pending').length;
  const pendingRecruiters = recruiters.filter(r => r.status === 'pending').length;
  const pendingCompanies = companies.filter(c => c.status === 'pending').length;
  const totalUsers = professionals.length + recruiters.length + companies.length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicants, 0);

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statCardLarge}>
          <View style={styles.statIcon}>
            <Users color="#3B82F6" size={28} />
          </View>
          <Text style={styles.statNumberLarge}>{totalUsers}</Text>
          <Text style={styles.statLabelLarge}>Total Users</Text>
        </View>
        <View style={styles.statCardLarge}>
          <View style={styles.statIcon}>
            <Briefcase color="#10B981" size={28} />
          </View>
          <Text style={styles.statNumberLarge}>{activeJobs}</Text>
          <Text style={styles.statLabelLarge}>Active Jobs</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCardSmall}>
          <Clock color="#F59E0B" size={20} />
          <Text style={styles.statNumberSmall}>{pendingProfessionals + pendingRecruiters + pendingCompanies}</Text>
          <Text style={styles.statLabelSmall}>Pending</Text>
        </View>
        <View style={styles.statCardSmall}>
          <TrendingUp color="#8B5CF6" size={20} />
          <Text style={styles.statNumberSmall}>{totalApplicants}</Text>
          <Text style={styles.statLabelSmall}>Applicants</Text>
        </View>
        <View style={styles.statCardSmall}>
          <Activity color="#EF4444" size={20} />
          <Text style={styles.statNumberSmall}>{professionals.filter(p => p.status === 'approved').length}</Text>
          <Text style={styles.statLabelSmall}>Approved</Text>
        </View>
      </View>

      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Pending Applications</Text>
        
        <Pressable
          style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
          onPress={() => setActiveTab('professionals')}
        >
          <View style={styles.quickActionLeft}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <User color="#3B82F6" size={24} />
            </View>
            <View>
              <Text style={styles.quickActionTitle}>Professional Applications</Text>
              <Text style={styles.quickActionSubtitle}>{pendingProfessionals} pending review</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingProfessionals}</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
          onPress={() => setActiveTab('recruiters')}
        >
          <View style={styles.quickActionLeft}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Users color="#10B981" size={24} />
            </View>
            <View>
              <Text style={styles.quickActionTitle}>Recruiter Applications</Text>
              <Text style={styles.quickActionSubtitle}>{pendingRecruiters} pending review</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingRecruiters}</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
          onPress={() => setActiveTab('companies')}
        >
          <View style={styles.quickActionLeft}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Building2 color="#F59E0B" size={24} />
            </View>
            <View>
              <Text style={styles.quickActionTitle}>Company Applications</Text>
              <Text style={styles.quickActionSubtitle}>{pendingCompanies} pending review</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCompanies}</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
          onPress={() => setActiveTab('jobs')}
        >
          <View style={styles.quickActionLeft}>
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Briefcase color="#8B5CF6" size={24} />
            </View>
            <View>
              <Text style={styles.quickActionTitle}>Job Postings</Text>
              <Text style={styles.quickActionSubtitle}>{activeJobs} active listings</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeJobs}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );

  const renderProfessionals = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Professional Applications</Text>
        <Text style={styles.listSubtitle}>{pendingProfessionals} pending review</Text>
      </View>

      {professionals.map((professional) => (
        <View key={professional.id} style={styles.applicationCard}>
          <View style={styles.applicationHeader}>
            <View style={styles.applicationIcon}>
              <User color={Colors.primary} size={24} />
            </View>
            <View style={styles.applicationHeaderText}>
              <Text style={styles.applicationName}>{professional.name}</Text>
              <Text style={styles.applicationTitle}>{professional.title}</Text>
            </View>
            {professional.status === 'pending' ? (
              <Clock color="#F59E0B" size={20} />
            ) : professional.status === 'approved' ? (
              <CheckCircle color={Colors.success} size={20} />
            ) : (
              <XCircle color={Colors.error} size={20} />
            )}
          </View>

          <View style={styles.applicationDetails}>
            <View style={styles.detailRow}>
              <Mail color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{professional.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Phone color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{professional.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{professional.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Briefcase color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{professional.experience} experience</Text>
            </View>
          </View>

          <View style={styles.skillsContainer}>
            {professional.skills.map((skill, idx) => (
              <View key={idx} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          {professional.status === 'pending' && (
            <View style={styles.actionsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.rejectButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => handleApproveApplication('professional', professional.id, 'rejected')}
              >
                <XCircle color={Colors.white} size={18} />
                <Text style={styles.actionButtonText}>Reject</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.approveButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => handleApproveApplication('professional', professional.id, 'approved')}
              >
                <CheckCircle color={Colors.white} size={18} />
                <Text style={styles.actionButtonText}>Approve</Text>
              </Pressable>
            </View>
          )}

          {professional.status !== 'pending' && (
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: professional.status === 'approved' ? Colors.success : Colors.error }]}>
                {professional.status.charAt(0).toUpperCase() + professional.status.slice(1)}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderRecruiters = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Recruiter Applications</Text>
        <Text style={styles.listSubtitle}>{pendingRecruiters} pending review</Text>
      </View>

      {recruiters.map((recruiter) => (
        <View key={recruiter.id} style={styles.applicationCard}>
          <View style={styles.applicationHeader}>
            <View style={styles.applicationIcon}>
              <Users color={Colors.success} size={24} />
            </View>
            <View style={styles.applicationHeaderText}>
              <Text style={styles.applicationName}>{recruiter.name}</Text>
              <Text style={styles.applicationTitle}>{recruiter.company}</Text>
            </View>
            {recruiter.status === 'pending' ? (
              <Clock color="#F59E0B" size={20} />
            ) : recruiter.status === 'approved' ? (
              <CheckCircle color={Colors.success} size={20} />
            ) : (
              <XCircle color={Colors.error} size={20} />
            )}
          </View>

          <View style={styles.applicationDetails}>
            <View style={styles.detailRow}>
              <Mail color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{recruiter.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Phone color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{recruiter.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{recruiter.location}</Text>
            </View>
          </View>

          {recruiter.status === 'pending' && (
            <View style={styles.actionsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.rejectButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => handleApproveApplication('recruiter', recruiter.id, 'rejected')}
              >
                <XCircle color={Colors.white} size={18} />
                <Text style={styles.actionButtonText}>Reject</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.approveButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => handleApproveApplication('recruiter', recruiter.id, 'approved')}
              >
                <CheckCircle color={Colors.white} size={18} />
                <Text style={styles.actionButtonText}>Approve</Text>
              </Pressable>
            </View>
          )}

          {recruiter.status !== 'pending' && (
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: recruiter.status === 'approved' ? Colors.success : Colors.error }]}>
                {recruiter.status.charAt(0).toUpperCase() + recruiter.status.slice(1)}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderCompanies = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Company Applications</Text>
        <Text style={styles.listSubtitle}>{pendingCompanies} pending review</Text>
      </View>

      {companies.map((company) => (
        <View key={company.id} style={styles.applicationCard}>
          <View style={styles.applicationHeader}>
            <View style={styles.applicationIcon}>
              <Building2 color="#F59E0B" size={24} />
            </View>
            <View style={styles.applicationHeaderText}>
              <Text style={styles.applicationName}>{company.companyName}</Text>
              <Text style={styles.applicationTitle}>{company.industry}</Text>
            </View>
            {company.status === 'pending' ? (
              <Clock color="#F59E0B" size={20} />
            ) : company.status === 'approved' ? (
              <CheckCircle color={Colors.success} size={20} />
            ) : (
              <XCircle color={Colors.error} size={20} />
            )}
          </View>

          <View style={styles.applicationDetails}>
            <View style={styles.detailRow}>
              <User color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{company.contactPerson}</Text>
            </View>
            <View style={styles.detailRow}>
              <Mail color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{company.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Phone color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{company.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{company.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <FileText color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>Reg: {company.registrationNumber}</Text>
            </View>
          </View>

          {company.status === 'pending' && (
            <View style={styles.actionsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.rejectButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => handleApproveApplication('company', company.id, 'rejected')}
              >
                <XCircle color={Colors.white} size={18} />
                <Text style={styles.actionButtonText}>Reject</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.approveButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => handleApproveApplication('company', company.id, 'approved')}
              >
                <CheckCircle color={Colors.white} size={18} />
                <Text style={styles.actionButtonText}>Approve</Text>
              </Pressable>
            </View>
          )}

          {company.status !== 'pending' && (
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: company.status === 'approved' ? Colors.success : Colors.error }]}>
                {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderJobs = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Job Postings</Text>
        <Text style={styles.listSubtitle}>{activeJobs} active listings</Text>
      </View>

      {jobs.map((job) => (
        <View key={job.id} style={styles.applicationCard}>
          <View style={styles.applicationHeader}>
            <View style={styles.applicationIcon}>
              <Briefcase color="#8B5CF6" size={24} />
            </View>
            <View style={styles.applicationHeaderText}>
              <Text style={styles.applicationName}>{job.title}</Text>
              <Text style={styles.applicationTitle}>{job.company}</Text>
            </View>
          </View>

          <View style={styles.applicationDetails}>
            <View style={styles.detailRow}>
              <MapPin color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{job.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{job.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <User color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>Posted by: {job.postedBy}</Text>
            </View>
            <View style={styles.detailRow}>
              <Users color={Colors.textLight} size={16} />
              <Text style={styles.detailText}>{job.applicants} applicants</Text>
            </View>
          </View>

          <View style={styles.jobActions}>
            <View style={[styles.statusBadgeInline, { backgroundColor: job.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : job.status === 'closed' ? 'rgba(107, 114, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
              <Text style={[styles.statusTextInline, { color: job.status === 'active' ? Colors.success : job.status === 'closed' ? Colors.textLight : Colors.error }]}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Text>
            </View>

            <View style={styles.jobActionButtons}>
              <Pressable
                style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                onPress={() => Alert.alert('View Job', `Viewing details for: ${job.title}`)}
              >
                <Eye color={Colors.primary} size={18} />
              </Pressable>
              {job.status === 'active' && (
                <Pressable
                  style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                  onPress={() => handleJobStatus(job.id, 'closed')}
                >
                  <XCircle color={Colors.error} size={18} />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderUsers = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>User Management</Text>
        <Text style={styles.listSubtitle}>All registered users</Text>
      </View>

      <View style={styles.userStatsGrid}>
        <View style={styles.userStatCard}>
          <User color="#3B82F6" size={24} />
          <Text style={styles.userStatNumber}>{professionals.filter(p => p.status === 'approved').length}</Text>
          <Text style={styles.userStatLabel}>Professionals</Text>
        </View>
        <View style={styles.userStatCard}>
          <Users color="#10B981" size={24} />
          <Text style={styles.userStatNumber}>{recruiters.filter(r => r.status === 'approved').length}</Text>
          <Text style={styles.userStatLabel}>Recruiters</Text>
        </View>
        <View style={styles.userStatCard}>
          <Building2 color="#F59E0B" size={24} />
          <Text style={styles.userStatNumber}>{companies.filter(c => c.status === 'approved').length}</Text>
          <Text style={styles.userStatLabel}>Companies</Text>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Shield color={Colors.textLight} size={48} />
        <Text style={styles.emptyStateText}>User management features</Text>
        <Text style={styles.emptyStateSubtext}>View, suspend, or manage user accounts</Text>
      </View>
    </View>
  );

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
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.iconCircle}>
                <Shield color={Colors.white} size={24} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.title}>Admin Dashboard</Text>
                <Text style={styles.subtitle}>Manage platform operations</Text>
              </View>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContainer}
          >
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'professionals', label: 'Professionals', icon: User },
              { key: 'recruiters', label: 'Recruiters', icon: Users },
              { key: 'companies', label: 'Companies', icon: Building2 },
              { key: 'jobs', label: 'Jobs', icon: Briefcase },
              { key: 'users', label: 'Users', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Pressable
                  key={tab.key}
                  style={({ pressed }) => [
                    styles.tab,
                    activeTab === tab.key && styles.tabActive,
                    pressed && styles.tabPressed,
                  ]}
                  onPress={() => setActiveTab(tab.key as TabType)}
                >
                  <Icon
                    color={activeTab === tab.key ? Colors.white : Colors.textLight}
                    size={18}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.key && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'professionals' && renderProfessionals()}
            {activeTab === 'recruiters' && renderRecruiters()}
            {activeTab === 'companies' && renderCompanies()}
            {activeTab === 'jobs' && renderJobs()}
            {activeTab === 'users' && renderUsers()}
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light,
    marginTop: 2,
  },
  tabsScroll: {
    maxHeight: 56,
  },
  tabsContainer: {
    paddingHorizontal: 24,
    gap: 8,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  overviewContainer: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardLarge: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumberLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
  },
  statLabelLarge: {
    fontSize: 13,
    color: Colors.light,
    textAlign: 'center',
  },
  statNumberSmall: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  statLabelSmall: {
    fontSize: 11,
    color: Colors.light,
    textAlign: 'center',
  },
  quickActionsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: Colors.light,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  listContainer: {
    gap: 16,
  },
  listHeader: {
    marginBottom: 4,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  listSubtitle: {
    fontSize: 13,
    color: Colors.light,
    marginTop: 4,
  },
  applicationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 12,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  applicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicationHeaderText: {
    flex: 1,
  },
  applicationName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  applicationTitle: {
    fontSize: 14,
    color: Colors.light,
    marginTop: 2,
  },
  applicationDetails: {
    gap: 10,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: Colors.white,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  skillBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93C5FD',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  statusBadge: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  jobActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusBadgeInline: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusTextInline: {
    fontSize: 13,
    fontWeight: '700',
  },
  jobActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  userStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  userStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  userStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  userStatLabel: {
    fontSize: 11,
    color: Colors.light,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light,
    textAlign: 'center',
  },
});
