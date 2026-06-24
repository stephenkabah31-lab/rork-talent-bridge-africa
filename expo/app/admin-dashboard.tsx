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
import React, { useMemo, useState } from 'react';
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
import { trpc } from '@/lib/trpc';

type ViewType = 'departments' | 'user-management' | 'job-management' | 'analytics' | 'system';
type SubViewType = 'professionals' | 'recruiters' | 'companies' | 'jobs' | 'overview';

export default function AdminDashboardScreen() {
  const [currentView, setCurrentView] = useState<ViewType>('departments');
  const [currentSubView, setCurrentSubView] = useState<SubViewType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // ── tRPC queries ───────────────────────────────────────────
  const professionalsQuery = trpc.admin.getProfessionals.useQuery();
  const recruitersQuery = trpc.admin.getRecruiters.useQuery();
  const companiesQuery = trpc.admin.getCompanies.useQuery();
  const jobsQuery = trpc.admin.getJobs.useQuery();

  const professionals = professionalsQuery.data ?? [];
  const recruiters = recruitersQuery.data ?? [];
  const companies = companiesQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];

  const isLoading =
    professionalsQuery.isLoading ||
    recruitersQuery.isLoading ||
    companiesQuery.isLoading ||
    jobsQuery.isLoading;

  const filteredProfessionals = useMemo(() => {
    let filtered = professionals;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [professionals, searchQuery, statusFilter]);

  const filteredRecruiters = useMemo(() => {
    let filtered = recruiters;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.company.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [recruiters, searchQuery, statusFilter]);

  const filteredCompanies = useMemo(() => {
    let filtered = companies;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [companies, searchQuery, statusFilter]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.postedBy.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [jobs, searchQuery]);

  const pendingProfessionals = professionals.filter((p) => p.status === 'pending').length;
  const pendingRecruiters = recruiters.filter((r) => r.status === 'pending').length;
  const pendingCompanies = companies.filter((c) => c.status === 'pending').length;
  const totalUsers = professionals.length + recruiters.length + companies.length;
  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicants, 0);

  const navigateToDetail = (type: string, id: string) => {
    router.push({
      pathname: '/admin-detail' as any,
      params: { type, id },
    });
  };

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
        {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
          <Pressable
            key={filter}
            style={({ pressed }) => [
              styles.filterButton,
              statusFilter === filter && styles.filterButtonActive,
              pressed && styles.filterButtonPressed,
            ]}
            onPress={() => setStatusFilter(filter)}
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
              <Text style={styles.departmentStatNumber}>{professionals.filter((p) => p.status === 'approved').length}</Text>
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
          <Text style={styles.statNumberSmall}>{jobs.filter((j) => j.status === 'closed').length}</Text>
          <Text style={styles.statLabelSmall}>Closed</Text>
        </View>
        <View style={styles.statCardSmall}>
          <Shield color="#EF4444" size={20} />
          <Text style={styles.statNumberSmall}>{jobs.filter((j) => j.status === 'flagged').length}</Text>
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
          <Text style={styles.statNumberSmall}>{professionals.filter((p) => p.status === 'approved').length}</Text>
          <Text style={styles.statLabelSmall}>Approved</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>User Breakdown</Text>
        <View style={styles.userStatsGrid}>
          <View style={styles.userStatCard}>
            <User color="#3B82F6" size={24} />
            <Text style={styles.userStatNumber}>{professionals.filter((p) => p.status === 'approved').length}</Text>
            <Text style={styles.userStatLabel}>Professionals</Text>
          </View>
          <View style={styles.userStatCard}>
            <Users color="#10B981" size={24} />
            <Text style={styles.userStatNumber}>{recruiters.filter((r) => r.status === 'approved').length}</Text>
            <Text style={styles.userStatLabel}>Recruiters</Text>
          </View>
          <View style={styles.userStatCard}>
            <Building2 color="#F59E0B" size={24} />
            <Text style={styles.userStatNumber}>{companies.filter((c) => c.status === 'approved').length}</Text>
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
            onPress={() => navigateToDetail('professional', professional.id)}
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
            onPress={() => navigateToDetail('recruiter', recruiter.id)}
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
            onPress={() => navigateToDetail('company', company.id)}
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
            onPress={() => navigateToDetail('job', job.id)}
          >
            <View style={styles.applicationHeader}>
              <View style={styles.applicationIcon}>
                <Briefcase color="#8B5CF6" size={24} />
              </View>
              <View style={styles.applicationHeaderText}>
                <Text style={styles.applicationName}>{job.title}</Text>
                <Text style={styles.applicationTitle}>{job.company}</Text>
              </View>
              <View style={[
                styles.statusBadgeInline,
                {
                  backgroundColor:
                    job.status === 'active'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : job.status === 'closed'
                        ? 'rgba(107, 114, 128, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                },
              ]}>
                <Text style={[
                  styles.statusTextInline,
                  {
                    color:
                      job.status === 'active'
                        ? Colors.success
                        : job.status === 'closed'
                          ? Colors.textLight
                          : Colors.error,
                  },
                ]}>
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
          headerStyle: { backgroundColor: 'transparent' },
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
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading data...</Text>
              </View>
            )}
            {!isLoading && currentView === 'departments' && renderDepartments()}
            {!isLoading && currentView === 'user-management' && !currentSubView && renderUserManagement()}
            {!isLoading && currentView === 'user-management' && currentSubView === 'professionals' && renderProfessionals()}
            {!isLoading && currentView === 'user-management' && currentSubView === 'recruiters' && renderRecruiters()}
            {!isLoading && currentView === 'user-management' && currentSubView === 'companies' && renderCompanies()}
            {!isLoading && currentView === 'job-management' && !currentSubView && renderJobManagement()}
            {!isLoading && currentView === 'job-management' && currentSubView === 'jobs' && renderJobs()}
            {!isLoading && currentView === 'analytics' && renderAnalytics()}
            {!isLoading && currentView === 'system' && renderSystem()}
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 100, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2, borderColor: '#3B82F6',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800' as const, color: Colors.white },
  subtitle: { fontSize: 13, color: Colors.light, marginTop: 2 },
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 24, marginVertical: 8,
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  backButtonPressed: { opacity: 0.7 },
  backButtonText: { fontSize: 15, fontWeight: '600' as const, color: Colors.white },
  departmentsContainer: { gap: 16 },
  departmentsTitle: { fontSize: 24, fontWeight: '800' as const, color: Colors.white, marginBottom: 4 },
  departmentsSubtitle: { fontSize: 14, color: Colors.light, marginBottom: 8 },
  departmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16, padding: 20, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12,
  },
  departmentIconWrapper: { alignItems: 'center', justifyContent: 'center' },
  departmentIcon: {
    width: 64, height: 64, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  departmentContent: { flex: 1 },
  departmentTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.white, marginBottom: 4 },
  departmentDescription: { fontSize: 13, color: Colors.light, marginBottom: 12 },
  departmentStats: { flexDirection: 'row', gap: 24 },
  departmentStatItem: { gap: 2 },
  departmentStatNumber: { fontSize: 20, fontWeight: '800' as const, color: Colors.white },
  departmentStatLabel: { fontSize: 11, color: Colors.textLight },
  subDepartmentContainer: { gap: 16 },
  subDepartmentTitle: { fontSize: 22, fontWeight: '800' as const, color: Colors.white },
  subDepartmentSubtitle: { fontSize: 14, color: Colors.light, marginBottom: 8 },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16, padding: 20, gap: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },
  overviewContainer: { gap: 16 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCardLarge: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16, padding: 20, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statCardSmall: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14, padding: 16, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  statNumberLarge: { fontSize: 32, fontWeight: '800' as const, color: Colors.white },
  statLabelLarge: { fontSize: 13, color: Colors.light, textAlign: 'center' },
  statNumberSmall: { fontSize: 22, fontWeight: '800' as const, color: Colors.white },
  statLabelSmall: { fontSize: 11, color: Colors.light, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.white, marginBottom: 12 },
  quickActionCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  quickActionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  quickActionIcon: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.white },
  quickActionSubtitle: { fontSize: 13, color: Colors.light, marginTop: 2 },
  cardPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  listContainer: { gap: 16 },
  listHeader: { marginBottom: 4 },
  listTitle: { fontSize: 20, fontWeight: '800' as const, color: Colors.white },
  listSubtitle: { fontSize: 13, color: Colors.light, marginTop: 4 },
  searchContainer: { marginBottom: 12 },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.white },
  filterContainer: { marginBottom: 16 },
  filterButton: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  filterButtonActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterButtonPressed: { opacity: 0.7 },
  filterButtonText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textLight },
  filterButtonTextActive: { color: Colors.white },
  applicationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16, padding: 18, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', marginBottom: 12,
  },
  applicationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  applicationIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  applicationHeaderText: { flex: 1 },
  applicationName: { fontSize: 17, fontWeight: '700' as const, color: Colors.white },
  applicationTitle: { fontSize: 14, color: Colors.light, marginTop: 2 },
  applicationDetails: { gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 14, color: Colors.white, flex: 1 },
  chevronContainer: { position: 'absolute', top: 18, right: 18 },
  statusBadgeInline: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  statusTextInline: { fontSize: 12, fontWeight: '700' as const },
  userStatsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  userStatCard: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12, padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  userStatNumber: { fontSize: 24, fontWeight: '800' as const, color: Colors.white },
  userStatLabel: { fontSize: 11, color: Colors.light, textAlign: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyStateText: { fontSize: 18, fontWeight: '700' as const, color: Colors.white },
  emptyStateSubtext: { fontSize: 14, color: Colors.light, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, color: Colors.white },
});
