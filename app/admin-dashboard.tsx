import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  Activity,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Search,
  Shield,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

type ViewType = 'departments' | 'user-management' | 'job-management' | 'analytics' | 'system';
type SubViewType = 'professionals' | 'recruiters' | 'companies' | 'jobs' | 'applications' | 'overview';

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
  const [currentView, setCurrentView] = useState<ViewType>('departments');
  const [currentSubView, setCurrentSubView] = useState<SubViewType | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalApplication[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterApplication[]>([]);
  const [companies, setCompanies] = useState<CompanyApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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

  const filteredProfessionals = useMemo(() => {
    let filtered = professionals;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [professionals, searchQuery, statusFilter]);

  const filteredRecruiters = useMemo(() => {
    let filtered = recruiters;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.company.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [recruiters, searchQuery, statusFilter]);

  const filteredCompanies = useMemo(() => {
    let filtered = companies;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.companyName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.contactPerson.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query) ||
        c.industry.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [companies, searchQuery, statusFilter]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.location.toLowerCase().includes(query) ||
        j.postedBy.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [jobs, searchQuery]);

  const pendingProfessionals = professionals.filter(p => p.status === 'pending').length;
  const pendingRecruiters = recruiters.filter(r => r.status === 'pending').length;
  const pendingCompanies = companies.filter(c => c.status === 'pending').length;
  const totalUsers = professionals.length + recruiters.length + companies.length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicants, 0);

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <Search color={Colors.textLight} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <X color={Colors.textLight} size={20} />
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['all', 'pending', 'approved', 'rejected'].map((filter) => (
          <Pressable
            key={filter}
            style={({ pressed }) => [
              styles.filterButton,
              statusFilter === filter && styles.filterButtonActive,
              pressed && styles.filterButtonPressed,
            ]}
            onPress={() => setStatusFilter(filter as typeof statusFilter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderDepartments = () => (
    <View style={styles.departmentsContainer}>
      <Text style={styles.departmentsTitle}>Departments</Text>
      <Text style={styles.departmentsSubtitle}>Select a department to manage</Text>

      <Pressable
        style={({ pressed }) => [
          styles.departmentCard,
          { borderLeftColor: '#3B82F6', borderLeftWidth: 4 },
          pressed && styles.cardPressed,
        ]}
        onPress={() => setCurrentView('user-management')}
      >
        <View style={styles.departmentIconWrapper}>
          <View style={[styles.departmentIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Users color="#3B82F6" size={32} />
          </View>
        </View>
        <View style={styles.departmentContent}>
          <Text style={styles.departmentTitle}>User Management</Text>
          <Text style={styles.departmentDescription}>Manage professionals, recruiters, and companies</Text>
          <View style={styles.departmentStats}>
            <View style={styles.departmentStatItem}>
              <Text style={styles.departmentStatNumber}>{totalUsers}</Text>
              <Text style={styles.departmentStatLabel}>Total Users</Text>
            </View>
            <View style={styles.departmentStatItem}>
              <Text style={styles.departmentStatNumber}>{pendingProfessionals + pendingRecruiters + pendingCompanies}</Text>
              <Text style={styles.departmentStatLabel}>Pending</Text>
            </View>
          </View>
        </View>
        <ChevronRight color={Colors.textLight} size={24} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.departmentCard,
          { borderLeftColor: '#10B981', borderLeftWidth: 4 },
          pressed && styles.cardPressed,
        ]}
        onPress={() => setCurrentView('job-management')}
      >
        <View style={styles.departmentIconWrapper}>
          <View style={[styles.departmentIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Briefcase color="#10B981" size={32} />
          </View>
        </View>
        <View style={styles.departmentContent}>
          <Text style={styles.departmentTitle}>Job Management</Text>
          <Text style={styles.departmentDescription}>Oversee job postings and applications</Text>
          <View style={styles.departmentStats}>
            <View style={styles.departmentStatItem}>
              <Text style={styles.departmentStatNumber}>{jobs.length}</Text>
              <Text style={styles.departmentStatLabel}>Total Jobs</Text>
            </View>
            <View style={styles.departmentStatItem}>
              <Text style={styles.departmentStatNumber}>{activeJobs}</Text>
              <Text style={styles.departmentStatLabel}>Active</Text>
            </View>
          </View>
        </View>
        <ChevronRight color={Colors.textLight} size={24} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.departmentCard,
          { borderLeftColor: '#F59E0B', borderLeftWidth: 4 },
          pressed && styles.cardPressed,
        ]}
        onPress={() => setCurrentView('analytics')}
      >
        <View style={styles.departmentIconWrapper}>
          <View style={[styles.departmentIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <TrendingUp color="#F59E0B" size={32} />
          </View>
        </View>
        <View style={styles.departmentContent}>
          <Text style={styles.departmentTitle}>Analytics & Reports</Text>
          <Text style={styles.departmentDescription}>View platform metrics and insights</Text>
          <View style={styles.departmentStats}>
            <View style={styles.departmentStatItem}>
              <Text style={styles.departmentStatNumber}>{totalApplicants}</Text>
              <Text style={styles.departmentStatLabel}>Applicants</Text>
            </View>
            <View style={styles.departmentStatItem}>
              <Text style={styles.departmentStatNumber}>{professionals.filter(p => p.status === 'approved').length}</Text>
              <Text style={styles.departmentStatLabel}>Approved</Text>
            </View>
          </View>
        </View>
        <ChevronRight color={Colors.textLight} size={24} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.departmentCard,
          { borderLeftColor: '#8B5CF6', borderLeftWidth: 4 },
          pressed && styles.cardPressed,
        ]}
        onPress={() => setCurrentView('system')}
      >
        <View style={styles.departmentIconWrapper}>
          <View style={[styles.departmentIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Shield color="#8B5CF6" size={32} />
          </View>
        </View>
        <View style={styles.departmentContent}>
          <Text style={styles.departmentTitle}>System & Settings</Text>
          <Text style={styles.departmentDescription}>Platform configuration and security</Text>
          <View style={styles.departmentStats}>
            <View style={styles.departmentStatItem}>
              <Text style={styles.departmentStatNumber}>•</Text>
              <Text style={styles.departmentStatLabel}>Configure</Text>
            </View>
          </View>
        </View>
        <ChevronRight color={Colors.textLight} size={24} />
      </Pressable>
    </View>
  );

  const renderUserManagement = () => (
    <View style={styles.subDepartmentContainer}>
      <Text style={styles.subDepartmentTitle}>User Management</Text>
      <Text style={styles.subDepartmentSubtitle}>Select a user type to manage</Text>

      <Pressable
        style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
        onPress={() => setCurrentSubView('professionals')}
      >
        <View style={styles.quickActionLeft}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <User color="#3B82F6" size={24} />
          </View>
          <View>
            <Text style={styles.quickActionTitle}>Professionals</Text>
            <Text style={styles.quickActionSubtitle}>{professionals.length} total • {pendingProfessionals} pending</Text>
          </View>
        </View>
        <ChevronRight color={Colors.textLight} size={24} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
        onPress={() => setCurrentSubView('recruiters')}
      >
        <View style={styles.quickActionLeft}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Users color="#10B981" size={24} />
          </View>
          <View>
            <Text style={styles.quickActionTitle}>Recruiters</Text>
            <Text style={styles.quickActionSubtitle}>{recruiters.length} total • {pendingRecruiters} pending</Text>
          </View>
        </View>
        <ChevronRight color={Colors.textLight} size={24} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
        onPress={() => setCurrentSubView('companies')}
      >
        <View style={styles.quickActionLeft}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <Building2 color="#F59E0B" size={24} />
          </View>
          <View>
            <Text style={styles.quickActionTitle}>Companies</Text>
            <Text style={styles.quickActionSubtitle}>{companies.length} total • {pendingCompanies} pending</Text>
          </View>
        </View>
        <ChevronRight color={Colors.textLight} size={24} />
      </Pressable>
    </View>
  );

  const renderJobManagement = () => (
    <View style={styles.subDepartmentContainer}>
      <Text style={styles.subDepartmentTitle}>Job Management</Text>
      <Text style={styles.subDepartmentSubtitle}>Manage job postings and applications</Text>

      <Pressable
        style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
        onPress={() => setCurrentSubView('jobs')}
      >
        <View style={styles.quickActionLeft}>
          <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Briefcase color="#8B5CF6" size={24} />
          </View>
          <View>
            <Text style={styles.quickActionTitle}>All Job Postings</Text>
            <Text style={styles.quickActionSubtitle}>{jobs.length} total • {activeJobs} active</Text>
          </View>
        </View>
        <ChevronRight color={Colors.textLight} size={24} />
      </Pressable>

      <View style={styles.statsGrid}>
        <View style={styles.statCardSmall}>
          <Activity color="#10B981" size={20} />
          <Text style={styles.statNumberSmall}>{activeJobs}</Text>
          <Text style={styles.statLabelSmall}>Active</Text>
        </View>
        <View style={styles.statCardSmall}>
          <Clock color="#6B7280" size={20} />
          <Text style={styles.statNumberSmall}>{jobs.filter(j => j.status === 'closed').length}</Text>
          <Text style={styles.statLabelSmall}>Closed</Text>
        </View>
        <View style={styles.statCardSmall}>
          <Shield color="#EF4444" size={20} />
          <Text style={styles.statNumberSmall}>{jobs.filter(j => j.status === 'flagged').length}</Text>
          <Text style={styles.statLabelSmall}>Flagged</Text>
        </View>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Analytics Dashboard</Text>
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

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>User Breakdown</Text>
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
      </View>
    </View>
  );

  const renderSystem = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>System & Settings</Text>
      <Text style={styles.listSubtitle}>Platform configuration and security</Text>

      <View style={styles.emptyState}>
        <Shield color={Colors.textLight} size={48} />
        <Text style={styles.emptyStateText}>System Configuration</Text>
        <Text style={styles.emptyStateSubtext}>Manage platform settings, security, and configurations</Text>
      </View>
    </View>
  );

  const renderProfessionals = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Professional Applications</Text>
        <Text style={styles.listSubtitle}>{filteredProfessionals.length} of {professionals.length}</Text>
      </View>

      {renderSearchBar()}
      {renderFilterBar()}

      {filteredProfessionals.length === 0 ? (
        <View style={styles.emptyState}>
          <User color={Colors.textLight} size={48} />
          <Text style={styles.emptyStateText}>No professionals found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        filteredProfessionals.map((professional) => (
          <Pressable
            key={professional.id}
            style={({ pressed }) => [
              styles.applicationCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => {
              router.push({
                pathname: '/admin-detail' as any,
                params: { type: 'professional', id: professional.id },
              });
            }}
          >
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
                <MapPin color={Colors.textLight} size={16} />
                <Text style={styles.detailText}>{professional.location}</Text>
              </View>
            </View>

            <View style={styles.chevronContainer}>
              <ChevronRight color={Colors.textLight} size={20} />
            </View>
          </Pressable>
        ))
      )}
    </View>
  );

  const renderRecruiters = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Recruiter Applications</Text>
        <Text style={styles.listSubtitle}>{filteredRecruiters.length} of {recruiters.length}</Text>
      </View>

      {renderSearchBar()}
      {renderFilterBar()}

      {filteredRecruiters.length === 0 ? (
        <View style={styles.emptyState}>
          <Users color={Colors.textLight} size={48} />
          <Text style={styles.emptyStateText}>No recruiters found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        filteredRecruiters.map((recruiter) => (
          <Pressable
            key={recruiter.id}
            style={({ pressed }) => [
              styles.applicationCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => {
              router.push({
                pathname: '/admin-detail' as any,
                params: { type: 'recruiter', id: recruiter.id },
              });
            }}
          >
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
                <MapPin color={Colors.textLight} size={16} />
                <Text style={styles.detailText}>{recruiter.location}</Text>
              </View>
            </View>

            <View style={styles.chevronContainer}>
              <ChevronRight color={Colors.textLight} size={20} />
            </View>
          </Pressable>
        ))
      )}
    </View>
  );

  const renderCompanies = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Company Applications</Text>
        <Text style={styles.listSubtitle}>{filteredCompanies.length} of {companies.length}</Text>
      </View>

      {renderSearchBar()}
      {renderFilterBar()}

      {filteredCompanies.length === 0 ? (
        <View style={styles.emptyState}>
          <Building2 color={Colors.textLight} size={48} />
          <Text style={styles.emptyStateText}>No companies found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        filteredCompanies.map((company) => (
          <Pressable
            key={company.id}
            style={({ pressed }) => [
              styles.applicationCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => {
              router.push({
                pathname: '/admin-detail' as any,
                params: { type: 'company', id: company.id },
              });
            }}
          >
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
                <Mail color={Colors.textLight} size={16} />
                <Text style={styles.detailText}>{company.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <MapPin color={Colors.textLight} size={16} />
                <Text style={styles.detailText}>{company.location}</Text>
              </View>
            </View>

            <View style={styles.chevronContainer}>
              <ChevronRight color={Colors.textLight} size={20} />
            </View>
          </Pressable>
        ))
      )}
    </View>
  );

  const renderJobs = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Job Postings</Text>
        <Text style={styles.listSubtitle}>{filteredJobs.length} of {jobs.length}</Text>
      </View>

      {renderSearchBar()}

      {filteredJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Briefcase color={Colors.textLight} size={48} />
          <Text style={styles.emptyStateText}>No jobs found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your search</Text>
        </View>
      ) : (
        filteredJobs.map((job) => (
          <Pressable
            key={job.id}
            style={({ pressed }) => [
              styles.applicationCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => {
              router.push({
                pathname: '/admin-detail' as any,
                params: { type: 'job', id: job.id },
              });
            }}
          >
            <View style={styles.applicationHeader}>
              <View style={styles.applicationIcon}>
                <Briefcase color="#8B5CF6" size={24} />
              </View>
              <View style={styles.applicationHeaderText}>
                <Text style={styles.applicationName}>{job.title}</Text>
                <Text style={styles.applicationTitle}>{job.company}</Text>
              </View>
              <View style={[styles.statusBadgeInline, { 
                backgroundColor: job.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 
                               job.status === 'closed' ? 'rgba(107, 114, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)' 
              }]}>
                <Text style={[styles.statusTextInline, { 
                  color: job.status === 'active' ? Colors.success : 
                         job.status === 'closed' ? Colors.textLight : Colors.error 
                }]}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.applicationDetails}>
              <View style={styles.detailRow}>
                <MapPin color={Colors.textLight} size={16} />
                <Text style={styles.detailText}>{job.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Users color={Colors.textLight} size={16} />
                <Text style={styles.detailText}>{job.applicants} applicants</Text>
              </View>
            </View>

            <View style={styles.chevronContainer}>
              <ChevronRight color={Colors.textLight} size={20} />
            </View>
          </Pressable>
        ))
      )}
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

          {currentView !== 'departments' && (
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              onPress={() => {
                if (currentSubView) {
                  setCurrentSubView(null);
                } else {
                  setCurrentView('departments');
                }
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              <ChevronRight color={Colors.white} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currentView === 'departments' && renderDepartments()}
            {currentView === 'user-management' && !currentSubView && renderUserManagement()}
            {currentView === 'user-management' && currentSubView === 'professionals' && renderProfessionals()}
            {currentView === 'user-management' && currentSubView === 'recruiters' && renderRecruiters()}
            {currentView === 'user-management' && currentSubView === 'companies' && renderCompanies()}
            {currentView === 'job-management' && !currentSubView && renderJobManagement()}
            {currentView === 'job-management' && currentSubView === 'jobs' && renderJobs()}
            {currentView === 'analytics' && renderAnalytics()}
            {currentView === 'system' && renderSystem()}
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
    fontWeight: '800' as const,
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light,
    marginTop: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 24,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  departmentsContainer: {
    gap: 16,
  },
  departmentsTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  departmentsSubtitle: {
    fontSize: 14,
    color: Colors.light,
    marginBottom: 8,
  },
  departmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  departmentIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  departmentIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  departmentContent: {
    flex: 1,
  },
  departmentTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  departmentDescription: {
    fontSize: 13,
    color: Colors.light,
    marginBottom: 12,
  },
  departmentStats: {
    flexDirection: 'row',
    gap: 24,
  },
  departmentStatItem: {
    gap: 2,
  },
  departmentStatNumber: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  departmentStatLabel: {
    fontSize: 11,
    color: Colors.textLight,
  },
  subDepartmentContainer: {
    gap: 16,
  },
  subDepartmentTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  subDepartmentSubtitle: {
    fontSize: 14,
    color: Colors.light,
    marginBottom: 8,
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    fontWeight: '800' as const,
    color: Colors.white,
  },
  statLabelLarge: {
    fontSize: 13,
    color: Colors.light,
    textAlign: 'center',
  },
  statNumberSmall: {
    fontSize: 22,
    fontWeight: '800' as const,
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
    fontWeight: '700' as const,
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
    fontWeight: '700' as const,
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
    fontWeight: '700' as const,
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
    fontWeight: '800' as const,
    color: Colors.white,
  },
  listSubtitle: {
    fontSize: 13,
    color: Colors.light,
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.white,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  filterButtonTextActive: {
    color: Colors.white,
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
    fontWeight: '700' as const,
    color: Colors.white,
  },
  applicationTitle: {
    fontSize: 14,
    color: Colors.light,
    marginTop: 2,
  },
  applicationDetails: {
    gap: 10,
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
  chevronContainer: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  statusBadgeInline: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusTextInline: {
    fontSize: 12,
    fontWeight: '700' as const,
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
    fontWeight: '800' as const,
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
    fontWeight: '700' as const,
    color: Colors.white,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light,
    textAlign: 'center',
  },
});
