import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Flag,
  Headphones,
  Landmark,
  Mail,
  MapPin,
  Megaphone,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  Smartphone,
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
import {
  AFRICAN_CURRENCIES,
  convertPrice,
  Currency,
} from '@/constants/currencies';
import { trpc } from '@/lib/trpc';

type DepartmentView =
  | 'departments'
  | 'user-management'
  | 'job-management'
  | 'marketing'
  | 'financials'
  | 'support'
  | 'analytics'
  | 'system';

type SubViewType = 'professionals' | 'recruiters' | 'companies' | 'jobs';

export default function AdminDashboardScreen() {
  const [currentView, setCurrentView] = useState<DepartmentView>('departments');
  const [currentSubView, setCurrentSubView] = useState<SubViewType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [finCurrency, setFinCurrency] = useState<Currency>(
    AFRICAN_CURRENCIES.find((c) => c.code === 'GHS') || AFRICAN_CURRENCIES[0]
  );

  // Payment config form state
  const [paymentConfig, setPaymentConfig] = useState({
    operationalAccount: { bankName: '', accountNumber: '', accountHolder: '', branchCode: '', swiftCode: '' },
    profitAccount: { bankName: '', accountNumber: '', accountHolder: '', branchCode: '', swiftCode: '' },
    mobileMoneyAccounts: [] as { provider: string; number: string; accountName: string }[],
  });
  const [configDirty, setConfigDirty] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // ── tRPC queries ───────────────────────────────────────────
  const professionalsQuery = trpc.admin.getProfessionals.useQuery();
  const recruitersQuery = trpc.admin.getRecruiters.useQuery();
  const companiesQuery = trpc.admin.getCompanies.useQuery();
  const jobsQuery = trpc.admin.getJobs.useQuery();
  const paymentConfigQuery = (trpc as any).payments?.getConfig?.useQuery?.() ?? { data: null };
  const transactionsQuery = (trpc as any).payments?.getTransactions?.useQuery?.({ limit: 50 }) ?? { data: [] };

  // Load payment config from query
  useEffect(() => {
    const cfg = paymentConfigQuery?.data;
    if (cfg && !configDirty) {
      setPaymentConfig({
        operationalAccount: cfg.operationalAccount ?? { bankName: '', accountNumber: '', accountHolder: '', branchCode: '', swiftCode: '' },
        profitAccount: cfg.profitAccount ?? { bankName: '', accountNumber: '', accountHolder: '', branchCode: '', swiftCode: '' },
        mobileMoneyAccounts: cfg.mobileMoneyAccounts ?? [],
      });
    }
  }, [paymentConfigQuery?.data]);

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
    if (statusFilter !== 'all') filtered = filtered.filter((p) => p.status === statusFilter);
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
    if (statusFilter !== 'all') filtered = filtered.filter((r) => r.status === statusFilter);
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
    if (statusFilter !== 'all') filtered = filtered.filter((c) => c.status === statusFilter);
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
  const totalPending = pendingProfessionals + pendingRecruiters + pendingCompanies;
  const totalUsers = professionals.length + recruiters.length + companies.length;
  const approvedUsers =
    professionals.filter((p) => p.status === 'approved').length +
    recruiters.filter((r) => r.status === 'approved').length +
    companies.filter((c) => c.status === 'approved').length;
  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const flaggedJobs = jobs.filter((j) => j.status === 'flagged').length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicants, 0);

  // Derived financial data
  const premiumRevenue = companies.filter((c) => c.status === 'approved').length * 49;

  const navigateToDetail = (type: string, id: string) => {
    router.push({
      pathname: '/admin-detail' as any,
      params: { type, id },
    });
  };

  const goBack = () => {
    if (currentSubView) {
      setCurrentSubView(null);
    } else {
      setCurrentView('departments');
    }
    setSearchQuery('');
    setStatusFilter('all');
  };

  // ── Shared UI components ───────────────────────────────────

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

  const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );

  const StatCardSmall = ({
    icon,
    value,
    label,
    color,
  }: {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    color: string;
  }) => (
    <View style={styles.statCardSmall}>
      {icon}
      <Text style={styles.statNumberSmall}>{value}</Text>
      <Text style={styles.statLabelSmall}>{label}</Text>
    </View>
  );

  // ── Department cards ───────────────────────────────────────

  const renderDepartmentCard = (
    title: string,
    description: string,
    icon: React.ReactNode,
    accentColor: string,
    stat1: string | number,
    stat1Label: string,
    stat2: string | number,
    stat2Label: string,
    onPress: () => void,
  ) => (
    <Pressable
      style={({ pressed }) => [
        styles.departmentCard,
        { borderLeftColor: accentColor, borderLeftWidth: 4 },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.departmentIconWrapper}>
        <View style={[styles.departmentIcon, { backgroundColor: `${accentColor}26` }]}>
          {icon}
        </View>
      </View>
      <View style={styles.departmentContent}>
        <Text style={styles.departmentTitle}>{title}</Text>
        <Text style={styles.departmentDescription}>{description}</Text>
        <View style={styles.departmentStats}>
          <View style={styles.departmentStatItem}>
            <Text style={styles.departmentStatNumber}>{stat1}</Text>
            <Text style={styles.departmentStatLabel}>{stat1Label}</Text>
          </View>
          <View style={styles.departmentStatItem}>
            <Text style={styles.departmentStatNumber}>{stat2}</Text>
            <Text style={styles.departmentStatLabel}>{stat2Label}</Text>
          </View>
        </View>
      </View>
      <ChevronRight color={Colors.textLight} size={24} />
    </Pressable>
  );

  const renderQuickActionCard = (
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    onPress: () => void,
  ) => (
    <Pressable
      style={({ pressed }) => [styles.quickActionCard, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.quickActionLeft}>
        <View style={styles.quickActionIcon}>{icon}</View>
        <View>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <ChevronRight color={Colors.textLight} size={24} />
    </Pressable>
  );

  // ── Main views ─────────────────────────────────────────────

  const renderDepartments = () => (
    <View style={styles.departmentsContainer}>
      <SectionTitle title="Departments" subtitle="Select a department to manage" />

      <Text style={styles.deptGroupTitle}>Management</Text>
      {renderDepartmentCard(
        'User Management',
        'Manage professionals, recruiters, and companies',
        <Users color="#3B82F6" size={32} />,
        '#3B82F6',
        totalUsers,
        'Total Users',
        totalPending,
        'Pending',
        () => setCurrentView('user-management'),
      )}
      {renderDepartmentCard(
        'Job Management',
        'Oversee job postings and applications',
        <Briefcase color="#10B981" size={32} />,
        '#10B981',
        jobs.length,
        'Total Jobs',
        activeJobs,
        'Active',
        () => setCurrentView('job-management'),
      )}

      <Text style={[styles.deptGroupTitle, { marginTop: 16 }]}>Operations</Text>
      {renderDepartmentCard(
        'Marketing',
        'Campaigns, promotions, and email marketing',
        <Megaphone color="#0EA5E9" size={32} />,
        '#0EA5E9',
        approvedUsers,
        'Reachable',
        0,
        'Campaigns',
        () => setCurrentView('marketing'),
      )}
      {renderDepartmentCard(
        'Financials',
        'Revenue, subscriptions, and transactions',
        <DollarSign color="#14B8A6" size={32} />,
        '#14B8A6',
        `$${premiumRevenue}`,
        'Est. Revenue',
        companies.filter((c) => c.status === 'approved').length,
        'Subscribers',
        () => setCurrentView('financials'),
      )}
      {renderDepartmentCard(
        'Support',
        'Tickets, flagged content, and user issues',
        <Headphones color="#EF4444" size={32} />,
        '#EF4444',
        flaggedJobs,
        'Flagged',
        totalPending,
        'Pending',
        () => setCurrentView('support'),
      )}

      <Text style={[styles.deptGroupTitle, { marginTop: 16 }]}>Insights</Text>
      {renderDepartmentCard(
        'Analytics & Reports',
        'View platform metrics and insights',
        <TrendingUp color="#F59E0B" size={32} />,
        '#F59E0B',
        totalApplicants,
        'Applicants',
        approvedUsers,
        'Approved',
        () => setCurrentView('analytics'),
      )}
      {renderDepartmentCard(
        'System & Settings',
        'Platform configuration and security',
        <Settings color="#6B7280" size={32} />,
        '#6B7280',
        '•',
        'Configure',
        '•',
        'Security',
        () => setCurrentView('system'),
      )}
    </View>
  );

  // ── User Management ───────────────────────────────────────
  const renderUserManagement = () => (
    <View style={styles.subDepartmentContainer}>
      <SectionTitle title="User Management" subtitle="Select a user type to manage" />

      {renderQuickActionCard(
        'Professionals',
        `${professionals.length} total · ${pendingProfessionals} pending`,
        <User color="#3B82F6" size={24} />,
        () => setCurrentSubView('professionals'),
      )}
      {renderQuickActionCard(
        'Recruiters',
        `${recruiters.length} total · ${pendingRecruiters} pending`,
        <Users color="#10B981" size={24} />,
        () => setCurrentSubView('recruiters'),
      )}
      {renderQuickActionCard(
        'Companies',
        `${companies.length} total · ${pendingCompanies} pending`,
        <Building2 color="#F59E0B" size={24} />,
        () => setCurrentSubView('companies'),
      )}
    </View>
  );

  // ── Job Management ────────────────────────────────────────
  const renderJobManagement = () => (
    <View style={styles.subDepartmentContainer}>
      <SectionTitle title="Job Management" subtitle="Manage job postings and applications" />

      {renderQuickActionCard(
        'All Job Postings',
        `${jobs.length} total · ${activeJobs} active`,
        <Briefcase color="#8B5CF6" size={24} />,
        () => setCurrentSubView('jobs'),
      )}

      <View style={styles.statsGrid}>
        <StatCardSmall icon={<Activity color="#10B981" size={20} />} value={activeJobs} label="Active" color="#10B981" />
        <StatCardSmall icon={<Clock color="#6B7280" size={20} />} value={jobs.filter((j) => j.status === 'closed').length} label="Closed" color="#6B7280" />
        <StatCardSmall icon={<Flag color="#EF4444" size={20} />} value={flaggedJobs} label="Flagged" color="#EF4444" />
      </View>
    </View>
  );

  // ── Marketing ─────────────────────────────────────────────
  const renderMarketing = () => (
    <View style={styles.listContainer}>
      <SectionTitle title="Marketing" subtitle="Campaigns, promotions, and email outreach" />

      <View style={styles.statsGrid}>
        <StatCardSmall icon={<Megaphone color="#0EA5E9" size={20} />} value={0} label="Campaigns" color="#0EA5E9" />
        <StatCardSmall icon={<Users color="#10B981" size={20} />} value={approvedUsers} label="Reachable" color="#10B981" />
        <StatCardSmall icon={<TrendingUp color="#F59E0B" size={20} />} value={totalUsers} label="Signups" color="#F59E0B" />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Active Campaigns</Text>
        <View style={styles.emptyState}>
          <Megaphone color={Colors.textLight} size={48} />
          <Text style={styles.emptyStateText}>No active campaigns</Text>
          <Text style={styles.emptyStateSubtext}>
            Create email campaigns, promotions, and job alerts for your users
          </Text>
        </View>
      </View>

      <View style={[styles.infoSection, { marginTop: 12 }]}>
        <Text style={styles.infoSectionTitle}>Email Marketing</Text>
        <View style={styles.metricRow}>
          <View>
            <Text style={styles.metricLabel}>Subscriber list</Text>
            <Text style={styles.metricValue}>{approvedUsers} users</Text>
          </View>
          <View>
            <Text style={styles.metricLabel}>Open rate (est.)</Text>
            <Text style={styles.metricValue}>--</Text>
          </View>
          <View>
            <Text style={styles.metricLabel}>Click rate (est.)</Text>
            <Text style={styles.metricValue}>--</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ── Financials ────────────────────────────────────────────
  const renderFinancials = () => {
    const txs = (transactionsQuery?.data ?? []) as any[];
    const completedTxns = txs.filter((t: any) => t.status === 'completed').length;
    const convertedRevenue = premiumRevenue + activeJobs * 15;

    return (
    <View style={styles.listContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle title="Financials" subtitle="Revenue, payments & accounts" />
        <Pressable
          style={({ pressed }) => [
            styles.currencySelector,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => setShowCurrencyPicker(true)}
        >
          <Text style={styles.currencyText}>{finCurrency.symbol} {finCurrency.code}</Text>
          <ChevronRight color={Colors.textLight} size={14} style={{ transform: [{ rotate: '90deg' }] }} />
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <StatCardSmall
          icon={<DollarSign color="#14B8A6" size={20} />}
          value={convertPrice(convertedRevenue, finCurrency)}
          label="Est. Revenue"
          color="#14B8A6"
        />
        <StatCardSmall
          icon={<Building2 color="#F59E0B" size={20} />}
          value={companies.filter((c) => c.status === 'approved').length}
          label="Subscribers"
          color="#F59E0B"
        />
        <StatCardSmall
          icon={<Briefcase color="#8B5CF6" size={20} />}
          value={convertPrice(activeJobs * 15, finCurrency)}
          label="Job Fees"
          color="#8B5CF6"
        />
        <StatCardSmall
          icon={<CheckCircle color="#10B981" size={20} />}
          value={completedTxns}
          label="Completed"
          color="#10B981"
        />
      </View>

      {/* Payment Accounts — Operational & Profit */}
      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Operational Account</Text>
        {['bankName', 'accountNumber', 'accountHolder'].map((key) => (
          <View key={key} style={{ marginBottom: 10 }}>
            <Text style={styles.inputLabelSm}>
              {key === 'bankName' ? 'Bank Name' : key === 'accountNumber' ? 'Account Number' : 'Account Holder'}
            </Text>
            <TextInput
              style={styles.inputField}
              placeholder={key === 'bankName' ? 'e.g. GCB Bank' : key === 'accountNumber' ? 'Account number' : 'Account holder name'}
              placeholderTextColor={Colors.textLight}
              value={(paymentConfig.operationalAccount as any)[key] ?? ''}
              onChangeText={(text) => {
                setPaymentConfig((prev) => ({
                  ...prev,
                  operationalAccount: { ...prev.operationalAccount, [key]: text },
                }));
                setConfigDirty(true);
              }}
            />
          </View>
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Profit Account</Text>
        {['bankName', 'accountNumber', 'accountHolder'].map((key) => (
          <View key={key} style={{ marginBottom: 10 }}>
            <Text style={styles.inputLabelSm}>
              {key === 'bankName' ? 'Bank Name' : key === 'accountNumber' ? 'Account Number' : 'Account Holder'}
            </Text>
            <TextInput
              style={styles.inputField}
              placeholder={key === 'bankName' ? 'e.g. Ecobank' : key === 'accountNumber' ? 'Account number' : 'Account holder name'}
              placeholderTextColor={Colors.textLight}
              value={(paymentConfig.profitAccount as any)[key] ?? ''}
              onChangeText={(text) => {
                setPaymentConfig((prev) => ({
                  ...prev,
                  profitAccount: { ...prev.profitAccount, [key]: text },
                }));
                setConfigDirty(true);
              }}
            />
          </View>
        ))}
      </View>

      {/* Mobile Money */}
      <View style={styles.infoSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={styles.infoSectionTitle}>Mobile Money</Text>
          <Pressable
            style={({ pressed }) => [
              { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              setPaymentConfig((prev) => ({
                ...prev,
                mobileMoneyAccounts: [...prev.mobileMoneyAccounts, { provider: '', number: '', accountName: '' }],
              }));
              setConfigDirty(true);
            }}
          >
            <Plus color={Colors.white} size={16} />
            <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>Add</Text>
          </Pressable>
        </View>
        {paymentConfig.mobileMoneyAccounts.map((mm, idx) => (
          <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Smartphone color={Colors.primary} size={16} />
              <Text style={{ color: Colors.white, fontWeight: '600', fontSize: 14, flex: 1 }}>Account {idx + 1}</Text>
              <Pressable
                onPress={() => {
                  setPaymentConfig((prev) => ({
                    ...prev,
                    mobileMoneyAccounts: prev.mobileMoneyAccounts.filter((_, i) => i !== idx),
                  }));
                  setConfigDirty(true);
                }}
              >
                <X color={Colors.error} size={16} />
              </Pressable>
            </View>
            <TextInput
              style={[styles.inputFieldSm, { marginBottom: 6 }]}
              placeholder="Provider (MTN, Vodafone, AirtelTigo)"
              placeholderTextColor={Colors.textLight}
              value={mm.provider}
              onChangeText={(text) => {
                setPaymentConfig((prev) => {
                  const updated = [...prev.mobileMoneyAccounts];
                  updated[idx] = { ...updated[idx], provider: text };
                  return { ...prev, mobileMoneyAccounts: updated };
                });
                setConfigDirty(true);
              }}
            />
            <TextInput
              style={[styles.inputFieldSm, { marginBottom: 6 }]}
              placeholder="Mobile Number"
              placeholderTextColor={Colors.textLight}
              keyboardType="phone-pad"
              value={mm.number}
              onChangeText={(text) => {
                setPaymentConfig((prev) => {
                  const updated = [...prev.mobileMoneyAccounts];
                  updated[idx] = { ...updated[idx], number: text };
                  return { ...prev, mobileMoneyAccounts: updated };
                });
                setConfigDirty(true);
              }}
            />
            <TextInput
              style={styles.inputFieldSm}
              placeholder="Account Name"
              placeholderTextColor={Colors.textLight}
              value={mm.accountName}
              onChangeText={(text) => {
                setPaymentConfig((prev) => {
                  const updated = [...prev.mobileMoneyAccounts];
                  updated[idx] = { ...updated[idx], accountName: text };
                  return { ...prev, mobileMoneyAccounts: updated };
                });
                setConfigDirty(true);
              }}
            />
          </View>
        ))}
      </View>

      {configDirty && (
        <Pressable
          style={({ pressed }) => [
            styles.saveConfigButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            (trpc as any).payments?.saveConfig?.mutate?.(paymentConfig).then(() => {
              setConfigDirty(false);
              paymentConfigQuery?.refetch?.();
            });
          }}
        >
          <Save color={Colors.white} size={18} />
          <Text style={styles.saveConfigText}>Save Payment Accounts</Text>
        </Pressable>
      )}

      {/* Subscription Plans */}
      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Subscription Plans</Text>
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Basic</Text>
            <Text style={styles.planPrice}>{finCurrency.symbol}0<Text style={styles.planPeriod}>/mo</Text></Text>
          </View>
        </View>
        <View style={[styles.planCard, { borderColor: '#D97706', borderWidth: 2, backgroundColor: 'rgba(217,119,6,0.05)' }]}>
          <View style={styles.planHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.planName, { color: '#D97706' }]}>Pro</Text>
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>POPULAR</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>{convertPrice(49, finCurrency)}<Text style={styles.planPeriod}>/mo</Text></Text>
          </View>
        </View>
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Enterprise</Text>
            <Text style={styles.planPrice}>{convertPrice(149, finCurrency)}<Text style={styles.planPeriod}>/mo</Text></Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={[styles.infoSection, { marginTop: 12 }]}>
        <Text style={styles.infoSectionTitle}>Recent Transactions</Text>
        {txs.length === 0 ? (
          <View style={styles.emptyState}>
            <DollarSign color={Colors.textLight} size={48} />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>Transactions will appear once payments are processed</Text>
          </View>
        ) : (
          txs.map((tx: any) => (
            <View key={tx.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 14 }}>{tx.userName || tx.userEmail}</Text>
                  <Text style={{ color: Colors.light, fontSize: 12 }}>{tx.planName} • {tx.amountLocal}</Text>
                  <Text style={{ color: Colors.textLight, fontSize: 11 }}>
                    {tx.paymentMethod === 'mobile_money' ? 'Mobile Money' : tx.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Debit Card'}
                  </Text>
                </View>
                <View style={[
                  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
                  tx.status === 'completed' ? { backgroundColor: 'rgba(16,185,129,0.2)' } :
                  tx.status === 'pending' ? { backgroundColor: 'rgba(245,158,11,0.2)' } :
                  { backgroundColor: 'rgba(239,68,68,0.2)' },
                ]}>
                  <Text style={{
                    fontSize: 11, fontWeight: '700',
                    color: tx.status === 'completed' ? '#10B981' : tx.status === 'pending' ? '#F59E0B' : '#EF4444',
                  }}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Currency Picker Modal */}
      {showCurrencyPicker && (
        <View style={styles.currencyModalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowCurrencyPicker(false)} />
          <View style={styles.currencyModalContent}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.white, marginBottom: 16 }}>Select Currency</Text>
            {AFRICAN_CURRENCIES.map((c) => (
              <Pressable
                key={c.code}
                style={[
                  {
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    padding: 16, borderRadius: 12, marginBottom: 8,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                  finCurrency.code === c.code && { backgroundColor: Colors.primary },
                ]}
                onPress={() => {
                  setFinCurrency(c);
                  setShowCurrencyPicker(false);
                }}
              >
                <Text style={{ color: Colors.white, fontSize: 15, fontWeight: '600' }}>{c.country} ({c.code})</Text>
                <Text style={{ color: finCurrency.code === c.code ? Colors.white : Colors.textLight, fontSize: 16 }}>{c.symbol}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
  };

  // ── Support ───────────────────────────────────────────────
  const renderSupport = () => (
    <View style={styles.listContainer}>
      <SectionTitle title="Support" subtitle="Tickets, flagged content, and user issues" />

      <View style={styles.statsGrid}>
        <StatCardSmall icon={<Headphones color="#0EA5E9" size={20} />} value={0} label="Open Tickets" color="#0EA5E9" />
        <StatCardSmall icon={<Flag color="#EF4444" size={20} />} value={flaggedJobs} label="Flagged" color="#EF4444" />
        <StatCardSmall icon={<Clock color="#F59E0B" size={20} />} value={totalPending} label="Pending" color="#F59E0B" />
        <StatCardSmall icon={<CheckCircle color="#10B981" size={20} />} value={0} label="Resolved" color="#10B981" />
      </View>

      {flaggedJobs > 0 ? (
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Flagged Jobs</Text>
          {jobs
            .filter((j) => j.status === 'flagged')
            .map((job) => (
              <Pressable
                key={job.id}
                style={({ pressed }) => [
                  styles.applicationCard,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => navigateToDetail('job', job.id)}
              >
                <View style={styles.applicationHeader}>
                  <View style={[styles.applicationIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                    <Flag color="#EF4444" size={20} />
                  </View>
                  <View style={styles.applicationHeaderText}>
                    <Text style={styles.applicationName}>{job.title}</Text>
                    <Text style={styles.applicationTitle}>{job.company}</Text>
                  </View>
                  <View style={[styles.statusBadgeInline, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                    <Text style={[styles.statusTextInline, { color: Colors.error }]}>Flagged</Text>
                  </View>
                </View>
                <View style={styles.applicationDetails}>
                  <View style={styles.detailRow}>
                    <MapPin color={Colors.textLight} size={16} />
                    <Text style={styles.detailText}>{job.location}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
        </View>
      ) : (
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Flagged Content</Text>
          <View style={styles.emptyState}>
            <CheckCircle color="#10B981" size={48} />
            <Text style={styles.emptyStateText}>No flagged content</Text>
            <Text style={styles.emptyStateSubtext}>Everything looks clean</Text>
          </View>
        </View>
      )}

      <View style={[styles.infoSection, { marginTop: 12 }]}>
        <Text style={styles.infoSectionTitle}>Common Issues</Text>
        {[
          'Account verification delays',
          'Job posting errors',
          'Payment issues',
          'Profile updates',
        ].map((issue) => (
          <View key={issue} style={styles.issueRow}>
            <Text style={styles.issueText}>{issue}</Text>
            <Text style={styles.issueCount}>0 cases</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── Analytics ─────────────────────────────────────────────
  const renderAnalytics = () => (
    <View style={styles.overviewContainer}>
      <SectionTitle title="Analytics Dashboard" />

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
        <StatCardSmall icon={<Clock color="#F59E0B" size={20} />} value={totalPending} label="Pending" color="#F59E0B" />
        <StatCardSmall icon={<TrendingUp color="#8B5CF6" size={20} />} value={totalApplicants} label="Applicants" color="#8B5CF6" />
        <StatCardSmall icon={<CheckCircle color="#10B981" size={20} />} value={approvedUsers} label="Approved" color="#10B981" />
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

  // ── System ────────────────────────────────────────────────
  const renderSystem = () => (
    <View style={styles.listContainer}>
      <SectionTitle title="System & Settings" subtitle="Platform configuration and security" />

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Platform Configuration</Text>
        {[
          { label: 'Site Name', value: 'TalentBridge' },
          { label: 'Default Language', value: 'English' },
          { label: 'Time Zone', value: 'UTC' },
          { label: 'Maintenance Mode', value: 'Off' },
        ].map((setting) => (
          <View key={setting.label} style={styles.settingRow}>
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <Text style={styles.settingValue}>{setting.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.infoSection, { marginTop: 12 }]}>
        <Text style={styles.infoSectionTitle}>Security</Text>
        {[
          { label: '2FA Required', value: 'No', valueColor: Colors.error },
          { label: 'Session Timeout', value: '24 hours' },
          { label: 'Password Min Length', value: '8 characters' },
          { label: 'Rate Limiting', value: 'Enabled' },
          { label: 'Audit Logging', value: 'Off', valueColor: Colors.warning },
        ].map((setting) => (
          <View key={setting.label} style={styles.settingRow}>
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <Text style={[styles.settingValue, setting.valueColor ? { color: setting.valueColor } : undefined]}>
              {setting.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── Sub-view renderers (Professionals, Recruiters, Companies, Jobs) ──

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
              <View style={[styles.applicationIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                <User color="#3B82F6" size={24} />
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
              <View style={[styles.applicationIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                <Users color="#10B981" size={24} />
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
              <View style={[styles.applicationIcon, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
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
              <View style={[styles.applicationIcon, { backgroundColor: 'rgba(139,92,246,0.1)' }]}>
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
              onPress={goBack}
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
            {!isLoading && currentView === 'marketing' && renderMarketing()}
            {!isLoading && currentView === 'financials' && renderFinancials()}
            {!isLoading && currentView === 'support' && renderSupport()}
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

  // ── Departments ──
  departmentsContainer: { gap: 4 },
  deptGroupTitle: {
    fontSize: 11, fontWeight: '700' as const, color: Colors.textLight,
    textTransform: 'uppercase' as const, letterSpacing: 2,
    marginBottom: 12, marginTop: 20, paddingLeft: 4,
  },
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

  // ── Sub-department ──
  subDepartmentContainer: { gap: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '800' as const, color: Colors.white },
  sectionSubtitle: { fontSize: 14, color: Colors.light, marginTop: 4 },

  // ── Info sections (used across views) ──
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16, padding: 20, gap: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoSectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.white, marginBottom: 4 },

  // ── Financial plan cards ──
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, padding: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 8,
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  planPrice: { fontSize: 22, fontWeight: '800' as const, color: Colors.white },
  planPeriod: { fontSize: 13, fontWeight: '400' as const, color: Colors.textLight },
  popularBadge: {
    backgroundColor: '#D97706', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  popularBadgeText: { fontSize: 10, fontWeight: '800' as const, color: Colors.white },

  // ── Metrics ──
  metricRow: { flexDirection: 'row', gap: 24, marginTop: 8 },
  metricLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: '800' as const, color: Colors.white },

  // ── Settings ──
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  settingLabel: { fontSize: 14, color: Colors.light },
  settingValue: { fontSize: 14, fontWeight: '600' as const, color: Colors.white },

  // ── Support issues ──
  issueRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  issueText: { fontSize: 14, color: Colors.light },
  issueCount: { fontSize: 13, color: Colors.textLight },

  // ── Shared ──
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

  // ── Quick action cards ──
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

  // ── List items ──
  listContainer: { gap: 16 },
  listHeader: { marginBottom: 4 },
  listTitle: { fontSize: 20, fontWeight: '800' as const, color: Colors.white },
  listSubtitle: { fontSize: 13, color: Colors.light, marginTop: 4 },

  // ── Search & filters ──
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
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterButtonPressed: { opacity: 0.7 },
  filterButtonText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textLight },
  filterButtonTextActive: { color: Colors.white },

  // ── Application cards ──
  applicationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16, padding: 18, borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', marginBottom: 12,
  },
  applicationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  applicationIcon: {
    width: 48, height: 48, borderRadius: 12,
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

  // ── Analytics user stats ──
  userStatsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  userStatCard: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12, padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  userStatNumber: { fontSize: 24, fontWeight: '800' as const, color: Colors.white },
  userStatLabel: { fontSize: 11, color: Colors.light, textAlign: 'center' },

  // ── Empty state ──
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  emptyStateText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
  emptyStateSubtext: { fontSize: 14, color: Colors.light, textAlign: 'center' },

  // ── Loading ──
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, color: Colors.white },

  // ── Financials inputs ──
  inputLabelSm: { fontSize: 12, fontWeight: '600' as const, color: Colors.textLight, marginBottom: 4 },
  inputField: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 14,
    fontSize: 14, color: Colors.white, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  inputFieldSm: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 10,
    fontSize: 13, color: Colors.white, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  currencySelector: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  currencyText: { fontSize: 14, fontWeight: '700' as const, color: Colors.white },
  saveConfigButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#14B8A6', padding: 16, borderRadius: 16, marginTop: 8, marginBottom: 16,
  },
  saveConfigText: { fontSize: 15, fontWeight: '700' as const, color: Colors.white },
  currencyModalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  currencyModalContent: {
    backgroundColor: Colors.darkLight, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '60%',
  },
});
