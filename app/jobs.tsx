import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  Briefcase,
  Crown,
  DollarSign,
  MapPin,
  Search,
  Building2,
  Clock,
  BadgeCheck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { AFRICAN_CURRENCIES, Currency } from '@/constants/currencies';

interface UserData {
  userType: 'professional' | 'recruiter' | 'company';
  fullName?: string;
  companyName?: string;
  email: string;
  isPremium?: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  description: string;
  recruiterName: string;
  salaryUSD?: { min: number; max: number };
  currencyType?: 'USD' | 'local';
  isVerified?: boolean;
}

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Africa',
    location: 'Accra, Ghana',
    salary: '$50,000 - $80,000',
    type: 'Full-time',
    postedDate: '2 days ago',
    description:
      'We are looking for an experienced software engineer to join our growing team.',
    recruiterName: 'Sarah Johnson',
    salaryUSD: { min: 50000, max: 80000 },
    currencyType: 'USD',
    isVerified: true,
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Innovation Hub',
    location: 'Lagos, Nigeria',
    salary: '$60,000 - $90,000',
    type: 'Full-time',
    postedDate: '5 days ago',
    description: 'Lead product strategy and development for our mobile platform.',
    recruiterName: 'Michael Chen',
    salaryUSD: { min: 60000, max: 90000 },
    currencyType: 'local',
    isVerified: true,
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'Creative Studios',
    location: 'Nairobi, Kenya',
    salary: '$40,000 - $65,000',
    type: 'Full-time',
    postedDate: '1 week ago',
    description: 'Design beautiful and intuitive user experiences for our products.',
    recruiterName: 'Emma Thompson',
    salaryUSD: { min: 40000, max: 65000 },
    currencyType: 'local',
    isVerified: false,
  },
  {
    id: '4',
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Cape Town, South Africa',
    salary: '$45,000 - $70,000',
    type: 'Full-time',
    postedDate: '3 days ago',
    description: 'Analyze data and provide insights to drive business decisions.',
    recruiterName: 'David Martinez',
    salaryUSD: { min: 45000, max: 70000 },
    currencyType: 'local',
    isVerified: true,
  },
  {
    id: '5',
    title: 'Marketing Manager',
    company: 'Brand Builders',
    location: 'Kigali, Rwanda',
    salary: '$50,000 - $75,000',
    type: 'Full-time',
    postedDate: '4 days ago',
    description: 'Develop and execute marketing strategies to grow our brand.',
    recruiterName: 'Lisa Anderson',
    salaryUSD: { min: 50000, max: 75000 },
    currencyType: 'USD',
    isVerified: false,
  },
];

function getCurrencyFromLocation(location: string): Currency {
  const locationLower = location.toLowerCase();
  
  const currency = AFRICAN_CURRENCIES.find(c => 
    locationLower.includes(c.country.toLowerCase())
  );
  
  return currency || AFRICAN_CURRENCIES.find(c => c.code === 'USD')!;
}

function formatSalary(job: Job): string {
  if (job.currencyType === 'USD' || !job.salaryUSD) {
    return job.salary;
  }
  
  const currency = getCurrencyFromLocation(job.location);
  const minSalary = Math.round(job.salaryUSD.min * currency.rate);
  const maxSalary = Math.round(job.salaryUSD.max * currency.rate);
  
  return `${currency.symbol}${minSalary.toLocaleString()} - ${currency.symbol}${maxSalary.toLocaleString()}`;
}

export default function JobsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: user } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const filteredJobs = MOCK_JOBS.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactRecruiter = (job: Job) => {
    if (user?.isPremium) {
      router.push({
        pathname: '/messages',
        params: { recruiterName: job.recruiterName, jobTitle: job.title },
      });
    } else {
      Alert.alert(
        'Premium Feature',
        'Upgrade to Premium to message recruiters directly. Free users can only respond when recruiters reach out first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
        {!user?.isPremium && (
          <Pressable
            style={({ pressed }) => [
              styles.premiumBanner,
              pressed && styles.premiumBannerPressed,
            ]}
            onPress={() => router.push('/subscription')}
          >
            <Crown color={Colors.primary} size={24} />
            <View style={styles.premiumTextContainer}>
              <Text style={styles.premiumTitle}>Limited Access</Text>
              <Text style={styles.premiumSubtitle}>
                Upgrade to message recruiters directly
              </Text>
            </View>
          </Pressable>
        )}

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search color={Colors.textLight} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs, companies, locations..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsCount}>
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </Text>

          {filteredJobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.companyIcon}>
                  <Building2 color={Colors.primary} size={24} />
                </View>
                <View style={styles.jobTitleContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                  </View>
                  <View style={styles.companyRow}>
                    <Text style={styles.jobCompany}>{job.company}</Text>
                    {job.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <BadgeCheck color={Colors.success} size={16} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.jobDetails}>
                <View style={styles.detailRow}>
                  <MapPin color={Colors.textLight} size={16} />
                  <Text style={styles.detailText}>{job.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <DollarSign color={Colors.textLight} size={16} />
                  <Text style={styles.detailText}>{formatSalary(job)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Briefcase color={Colors.textLight} size={16} />
                  <Text style={styles.detailText}>{job.type}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock color={Colors.textLight} size={16} />
                  <Text style={styles.detailText}>{job.postedDate}</Text>
                </View>
              </View>

              <Text style={styles.jobDescription}>{job.description}</Text>

              <View style={styles.jobActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.applyButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() =>
                    Alert.alert('Apply', `Apply to ${job.title} at ${job.company}?`)
                  }
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.messageButton,
                    !user?.isPremium && styles.messageButtonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => handleContactRecruiter(job)}
                >
                  {!user?.isPremium && (
                    <Crown color={Colors.primary} size={16} strokeWidth={2} />
                  )}
                  <Text
                    style={[
                      styles.messageButtonText,
                      !user?.isPremium && styles.messageButtonTextDisabled,
                    ]}
                  >
                    Message
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  premiumBanner: {
    backgroundColor: Colors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumBannerPressed: {
    opacity: 0.7,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 16,
  },
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  jobDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
  },
  jobDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  messageButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  messageButtonDisabled: {
    borderColor: Colors.textLight,
    backgroundColor: Colors.light,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  messageButtonTextDisabled: {
    color: Colors.textLight,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
});
