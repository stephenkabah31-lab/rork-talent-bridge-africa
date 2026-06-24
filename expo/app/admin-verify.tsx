import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

export default function AdminVerifyScreen() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = trpc.admin.getCompanies.useQuery();

  const updateStatusMutation = trpc.admin.updateStatus.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
    },
  });

  const handleVerifyCompany = async (companyId: string, status: 'verified' | 'rejected') => {
    const company = filteredCompanies.find((c: any) => c.id === companyId);
    if (!company) return;
    const actionText = status === 'verified' ? 'verify' : 'reject';

    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Company`,
      `Are you sure you want to ${actionText} ${company.companyName || company.company_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === 'verified' ? 'Verify' : 'Reject',
          style: status === 'verified' ? 'default' : 'destructive',
          onPress: () => {
            updateStatusMutation.mutate({ type: 'company', id: companyId, status: status === 'verified' ? 'approved' : 'rejected' });
          },
        },
      ]
    );
  };

  const mappedCompanies = companies.map((c: any) => ({
    ...c,
    id: c.id,
    companyName: c.companyName || c.company_name || '',
    contactPerson: c.contactPerson || c.contact_person || '',
    email: c.email || '',
    phone: c.phone || '',
    location: c.location || '',
    industry: c.industry || '',
    website: c.website || '',
    registrationNumber: c.registrationNumber || c.registration_number || '',
    verificationStatus: c.status || 'pending',
    createdAt: c.createdAt || c.created_at || '',
  }));

  const filteredCompanies = mappedCompanies.filter((company: any) => {
    if (filter === 'all') return true;
    return company.verificationStatus === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return Colors.success;
      case 'rejected':
        return Colors.error;
      case 'pending':
      default:
        return '#F59E0B';
    }
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'verified':
      case 'approved':
        return <CheckCircle color={color} size={20} />;
      case 'rejected':
        return <XCircle color={color} size={20} />;
      case 'pending':
      default:
        return <Clock color={color} size={20} />;
    }
  };

  const pendingCount = mappedCompanies.filter((c: any) => c.verificationStatus === 'pending').length;
  const verifiedCount = mappedCompanies.filter((c: any) => c.verificationStatus === 'verified' || c.verificationStatus === 'approved').length;
  const rejectedCount = mappedCompanies.filter((c: any) => c.verificationStatus === 'rejected').length;

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
            <Text style={styles.title}>Company Verification</Text>
            <Text style={styles.subtitle}>Review and verify company registrations</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Clock color="#F59E0B" size={24} />
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle color={Colors.success} size={24} />
              <Text style={styles.statNumber}>{verifiedCount}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statCard}>
              <XCircle color={Colors.error} size={24} />
              <Text style={styles.statNumber}>{rejectedCount}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>

          <View style={styles.filterContainer}>
            {(['all', 'pending', 'verified', 'rejected'] as const).map((filterOption) => (
              <Pressable
                key={filterOption}
                style={({ pressed }) => [
                  styles.filterButton,
                  filter === filterOption && styles.filterButtonActive,
                  pressed && styles.filterButtonPressed,
                ]}
                onPress={() => setFilter(filterOption)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === filterOption && styles.filterButtonTextActive,
                  ]}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.white} />
              </View>
            ) : filteredCompanies.length === 0 ? (
              <View style={styles.emptyState}>
                <Building2 color={Colors.textLight} size={48} />
                <Text style={styles.emptyStateText}>No companies found</Text>
              </View>
            ) : (
              filteredCompanies.map((company: any) => (
                <View key={company.id || company.companyName} style={styles.companyCard}>
                  <View style={styles.companyHeader}>
                    <View style={styles.companyIcon}>
                      <Building2 color={Colors.primary} size={24} />
                    </View>
                    <View style={styles.companyHeaderText}>
                      <Text style={styles.companyName}>{company.companyName}</Text>
                      <View style={styles.statusBadge}>
                        {getStatusIcon(company.verificationStatus)}
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(company.verificationStatus) },
                          ]}
                        >
                          {company.verificationStatus.charAt(0).toUpperCase() +
                            company.verificationStatus.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.companyDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Contact Person:</Text>
                      <Text style={styles.detailValue}>{company.contactPerson}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Mail color={Colors.textLight} size={16} />
                      <Text style={styles.detailValue}>{company.email}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Phone color={Colors.textLight} size={16} />
                      <Text style={styles.detailValue}>{company.phone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin color={Colors.textLight} size={16} />
                      <Text style={styles.detailValue}>{company.location}</Text>
                    </View>
                    {company.website && (
                      <View style={styles.detailRow}>
                        <Globe color={Colors.textLight} size={16} />
                        <Text style={styles.detailValue}>{company.website}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Industry:</Text>
                      <Text style={styles.detailValue}>{company.industry}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Registration #:</Text>
                      <Text style={styles.detailValue}>{company.registrationNumber}</Text>
                    </View>
                    {company.verificationDocName && (
                      <View style={styles.detailRow}>
                        <FileText color={Colors.textLight} size={16} />
                        <Text style={styles.detailValue}>{company.verificationDocName}</Text>
                      </View>
                    )}
                  </View>

                  {company.verificationStatus === 'pending' && (
                    <View style={styles.actionsContainer}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.actionButton,
                          styles.rejectButton,
                          pressed && styles.actionButtonPressed,
                        ]}
                        onPress={() => handleVerifyCompany(company.id, 'rejected')}
                      >
                        <XCircle color={Colors.white} size={20} />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.actionButton,
                          styles.verifyButton,
                          pressed && styles.actionButtonPressed,
                        ]}
                        onPress={() => handleVerifyCompany(company.id, 'verified')}
                      >
                        <CheckCircle color={Colors.white} size={20} />
                        <Text style={styles.actionButtonText}>Verify</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            )}
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  companyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyHeaderText: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  companyDetails: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.white,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  verifyButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
