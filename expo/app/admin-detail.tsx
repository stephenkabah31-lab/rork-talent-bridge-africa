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
import React from 'react';
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
import { trpc } from '@/lib/trpc';

export default function AdminDetailScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();

  // ── tRPC queries ─────────────────────────────────────────────
  const professionalsQuery = trpc.admin.getProfessionals.useQuery(undefined, { enabled: type === 'professional' });
  const recruitersQuery = trpc.admin.getRecruiters.useQuery(undefined, { enabled: type === 'recruiter' });
  const companiesQuery = trpc.admin.getCompanies.useQuery(undefined, { enabled: type === 'company' });
  const jobsQuery = trpc.admin.getJobs.useQuery(undefined, { enabled: type === 'job' });
  const jobApplicantsQuery = trpc.admin.getJobApplicants.useQuery(
    { jobId: id ?? '' },
    { enabled: type === 'job' && !!id },
  );

  // ── tRPC mutations ───────────────────────────────────────────
  const approveProfessional = trpc.admin.approveProfessional.useMutation();
  const rejectProfessional = trpc.admin.rejectProfessional.useMutation();
  const approveRecruiter = trpc.admin.approveRecruiter.useMutation();
  const rejectRecruiter = trpc.admin.rejectRecruiter.useMutation();
  const approveCompany = trpc.admin.approveCompany.useMutation();
  const rejectCompany = trpc.admin.rejectCompany.useMutation();
  const updateJobStatusMut = trpc.admin.updateJobStatus.useMutation();

  let data: any = null;
  if (type === 'professional') data = professionalsQuery.data?.find((p: { id: string }) => p.id === id) ?? null;
  else if (type === 'recruiter') data = recruitersQuery.data?.find((r: { id: string }) => r.id === id) ?? null;
  else if (type === 'company') data = companiesQuery.data?.find((c: { id: string }) => c.id === id) ?? null;
  else if (type === 'job') data = jobsQuery.data?.find((j: { id: string }) => j.id === id) ?? null;

  const applicants = jobApplicantsQuery.data ?? [];

  const isLoading =
    (type === 'professional' && professionalsQuery.isLoading) ||
    (type === 'recruiter' && recruitersQuery.isLoading) ||
    (type === 'company' && companiesQuery.isLoading) ||
    (type === 'job' && jobsQuery.isLoading);

  const handleApprove = () => {
    if (!data || !id || type === 'job') return;
    Alert.alert('Approve Application', `Are you sure you want to approve this ${type} application?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        style: 'default',
        onPress: () => {
          if (type === 'professional') {
            approveProfessional.mutate({ id });
            professionalsQuery.refetch();
          } else if (type === 'recruiter') {
            approveRecruiter.mutate({ id });
            recruitersQuery.refetch();
          } else if (type === 'company') {
            approveCompany.mutate({ id });
            companiesQuery.refetch();
          }
        },
      },
    ]);
  };

  const handleReject = () => {
    if (!data || !id || type === 'job') return;
    Alert.alert('Reject Application', `Are you sure you want to reject this ${type} application?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          if (type === 'professional') {
            rejectProfessional.mutate({ id });
            professionalsQuery.refetch();
          } else if (type === 'recruiter') {
            rejectRecruiter.mutate({ id });
            recruitersQuery.refetch();
          } else if (type === 'company') {
            rejectCompany.mutate({ id });
            companiesQuery.refetch();
          }
        },
      },
    ]);
  };

  const handleJobStatus = (status: 'active' | 'closed' | 'flagged') => {
    if (!data || type !== 'job' || !id) return;
    updateJobStatusMut.mutate({ id, status });
    jobsQuery.refetch();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.dark, Colors.darkLight]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const renderProfessionalDetail = () => {
    const professional = data;
    return (
      <View style={styles.detailContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircleLarge}>
            <User color={Colors.primary} size={32} />
          </View>
          <Text style={styles.detailName}>{professional.name}</Text>
          <Text style={styles.detailTitle}>{professional.title}</Text>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                professional.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                professional.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                'rgba(245, 158, 11, 0.2)',
            },
          ]}>
            <Text style={[
              styles.statusText,
              {
                color:
                  professional.status === 'approved' ? Colors.success :
                  professional.status === 'rejected' ? Colors.error :
                  '#F59E0B',
              },
            ]}>
              {professional.status.charAt(0).toUpperCase() + professional.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow icon={<Mail color={Colors.textLight} size={20} />} label="Email" value={professional.email} />
          <InfoRow icon={<Phone color={Colors.textLight} size={20} />} label="Phone" value={professional.phone} />
          <InfoRow icon={<MapPin color={Colors.textLight} size={20} />} label="Location" value={professional.location} />
          <InfoRow icon={<Briefcase color={Colors.textLight} size={20} />} label="Experience" value={professional.experience} />
          <InfoRow icon={<Calendar color={Colors.textLight} size={20} />} label="Applied On" value={formatDate(professional.createdAt)} />
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {professional.skills.map((skill: string, idx: number) => (
              <View key={idx} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
        {professional.status === 'pending' && (
          <View style={styles.actionsSection}>
            <ActionButton icon={<XCircle color={Colors.white} size={20} />} label="Reject" variant="reject" onPress={handleReject} />
            <ActionButton icon={<CheckCircle color={Colors.white} size={20} />} label="Approve" variant="approve" onPress={handleApprove} />
          </View>
        )}
      </View>
    );
  };

  const renderRecruiterDetail = () => {
    const recruiter = data;
    return (
      <View style={styles.detailContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircleLarge}>
            <Users color={Colors.success} size={32} />
          </View>
          <Text style={styles.detailName}>{recruiter.name}</Text>
          <Text style={styles.detailTitle}>{recruiter.company}</Text>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                recruiter.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                recruiter.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                'rgba(245, 158, 11, 0.2)',
            },
          ]}>
            <Text style={[
              styles.statusText,
              {
                color:
                  recruiter.status === 'approved' ? Colors.success :
                  recruiter.status === 'rejected' ? Colors.error :
                  '#F59E0B',
              },
            ]}>
              {recruiter.status.charAt(0).toUpperCase() + recruiter.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow icon={<Mail color={Colors.textLight} size={20} />} label="Email" value={recruiter.email} />
          <InfoRow icon={<Phone color={Colors.textLight} size={20} />} label="Phone" value={recruiter.phone} />
          <InfoRow icon={<MapPin color={Colors.textLight} size={20} />} label="Location" value={recruiter.location} />
          <InfoRow icon={<Building2 color={Colors.textLight} size={20} />} label="Company" value={recruiter.company} />
          <InfoRow icon={<Calendar color={Colors.textLight} size={20} />} label="Applied On" value={formatDate(recruiter.createdAt)} />
        </View>
        {recruiter.status === 'pending' && (
          <View style={styles.actionsSection}>
            <ActionButton icon={<XCircle color={Colors.white} size={20} />} label="Reject" variant="reject" onPress={handleReject} />
            <ActionButton icon={<CheckCircle color={Colors.white} size={20} />} label="Approve" variant="approve" onPress={handleApprove} />
          </View>
        )}
      </View>
    );
  };

  const renderCompanyDetail = () => {
    const company = data;
    return (
      <View style={styles.detailContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircleLarge}>
            <Building2 color="#F59E0B" size={32} />
          </View>
          <Text style={styles.detailName}>{company.companyName}</Text>
          <Text style={styles.detailTitle}>{company.industry}</Text>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                company.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' :
                company.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                'rgba(245, 158, 11, 0.2)',
            },
          ]}>
            <Text style={[
              styles.statusText,
              {
                color:
                  company.status === 'approved' ? Colors.success :
                  company.status === 'rejected' ? Colors.error :
                  '#F59E0B',
              },
            ]}>
              {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <InfoRow icon={<User color={Colors.textLight} size={20} />} label="Contact Person" value={company.contactPerson} />
          <InfoRow icon={<Mail color={Colors.textLight} size={20} />} label="Email" value={company.email} />
          <InfoRow icon={<Phone color={Colors.textLight} size={20} />} label="Phone" value={company.phone} />
          <InfoRow icon={<MapPin color={Colors.textLight} size={20} />} label="Location" value={company.location} />
          <InfoRow icon={<Globe color={Colors.textLight} size={20} />} label="Website" value={company.website} />
          <InfoRow icon={<FileText color={Colors.textLight} size={20} />} label="Registration Number" value={company.registrationNumber} />
          <InfoRow icon={<Calendar color={Colors.textLight} size={20} />} label="Applied On" value={formatDate(company.createdAt)} />
        </View>
        {company.status === 'pending' && (
          <View style={styles.actionsSection}>
            <ActionButton icon={<XCircle color={Colors.white} size={20} />} label="Reject" variant="reject" onPress={handleReject} />
            <ActionButton icon={<CheckCircle color={Colors.white} size={20} />} label="Approve" variant="approve" onPress={handleApprove} />
          </View>
        )}
      </View>
    );
  };

  const renderJobDetail = () => {
    const job = data;
    return (
      <View style={styles.detailContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircleLarge}>
            <Briefcase color="#8B5CF6" size={32} />
          </View>
          <Text style={styles.detailName}>{job.title}</Text>
          <Text style={styles.detailTitle}>{job.company}</Text>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                job.status === 'active' ? 'rgba(16, 185, 129, 0.2)' :
                job.status === 'closed' ? 'rgba(107, 114, 128, 0.2)' :
                'rgba(239, 68, 68, 0.2)',
            },
          ]}>
            <Text style={[
              styles.statusText,
              {
                color:
                  job.status === 'active' ? Colors.success :
                  job.status === 'closed' ? Colors.textLight :
                  Colors.error,
              },
            ]}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Job Information</Text>
          <InfoRow icon={<MapPin color={Colors.textLight} size={20} />} label="Location" value={job.location} />
          <InfoRow icon={<Clock color={Colors.textLight} size={20} />} label="Type" value={job.type} />
          <InfoRow icon={<User color={Colors.textLight} size={20} />} label="Posted By" value={job.postedBy} />
          <InfoRow icon={<Users color={Colors.textLight} size={20} />} label="Applicants" value={`${job.applicants} candidates`} />
          <InfoRow icon={<Calendar color={Colors.textLight} size={20} />} label="Posted On" value={formatDate(job.postedAt)} />
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Applicants ({applicants.length})</Text>
          {applicants.map((applicant: any) => (
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
                <View style={[
                  styles.applicantStatusBadge,
                  {
                    backgroundColor:
                      applicant.status === 'shortlisted' ? 'rgba(16, 185, 129, 0.15)' :
                      applicant.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' :
                      'rgba(245, 158, 11, 0.15)',
                  },
                ]}>
                  <Text style={[
                    styles.applicantStatusText,
                    {
                      color:
                        applicant.status === 'shortlisted' ? Colors.success :
                        applicant.status === 'rejected' ? Colors.error :
                        '#F59E0B',
                    },
                  ]}>
                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.actionsSection}>
          {job.status === 'active' && (
            <ActionButton icon={<XCircle color={Colors.white} size={20} />} label="Close Job" variant="warning" onPress={() => handleJobStatus('closed')} />
          )}
          {job.status === 'closed' && (
            <ActionButton icon={<CheckCircle color={Colors.white} size={20} />} label="Reopen Job" variant="approve" onPress={() => handleJobStatus('active')} />
          )}
          <ActionButton icon={<Shield color={Colors.white} size={20} />} label="Flag" variant="reject" onPress={() => handleJobStatus('flagged')} />
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
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <View style={styles.container}>
        <LinearGradient colors={[Colors.dark, Colors.darkLight]} style={StyleSheet.absoluteFillObject} />
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

/** Reusable info row */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={infoRowStyles.row}>
      {icon}
      <View style={infoRowStyles.content}>
        <Text style={infoRowStyles.label}>{label}</Text>
        <Text style={infoRowStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  content: { flex: 1 },
  label: { fontSize: 13, color: Colors.textLight, marginBottom: 4 },
  value: { fontSize: 15, color: Colors.white, fontWeight: '600' as const },
});

/** Reusable action button */
function ActionButton({
  icon,
  label,
  variant,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  variant: 'approve' | 'reject' | 'warning';
  onPress: () => void;
}) {
  const bg =
    variant === 'approve' ? Colors.success :
    variant === 'reject' ? Colors.error :
    '#6B7280';
  return (
    <Pressable style={({ pressed }) => [actionStyles.btn, { backgroundColor: bg }, pressed && actionStyles.pressed]} onPress={onPress}>
      {icon}
      <Text style={actionStyles.text}>{label}</Text>
    </Pressable>
  );
}

const actionStyles = StyleSheet.create({
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: 14,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  text: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 100 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, color: Colors.white },
  detailContainer: { gap: 24 },
  headerSection: {
    alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20, padding: 32, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconCircleLarge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  detailName: { fontSize: 26, fontWeight: '800' as const, color: Colors.white, marginBottom: 4, textAlign: 'center' },
  detailTitle: { fontSize: 16, color: Colors.light, marginBottom: 16, textAlign: 'center' },
  statusBadge: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 12 },
  statusText: { fontSize: 14, fontWeight: '700' as const },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16,
    padding: 20, gap: 16, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.white, marginBottom: 8 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingVertical: 8,
    paddingHorizontal: 14, borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  skillText: { fontSize: 13, fontWeight: '600' as const, color: '#93C5FD' },
  applicantCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  applicantHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  applicantIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  applicantInfo: { flex: 1 },
  applicantName: { fontSize: 15, fontWeight: '700' as const, color: Colors.white, marginBottom: 2 },
  applicantTitle: { fontSize: 13, color: Colors.light, marginBottom: 2 },
  applicantDate: { fontSize: 11, color: Colors.textLight },
  applicantStatusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  applicantStatusText: { fontSize: 11, fontWeight: '700' as const },
  actionsSection: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
