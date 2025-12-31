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
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
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
  requiredSkills?: string[];
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
      'We are looking for an experienced software engineer to join our growing team in Accra. You will be working on cutting-edge technology, building scalable web and mobile applications that serve millions of users across Africa. This role offers excellent growth opportunities and the chance to work with a talented team of engineers.\n\nKey Responsibilities:\n• Design and develop high-quality software solutions\n• Collaborate with cross-functional teams\n• Participate in code reviews and technical discussions\n• Mentor junior developers\n\nRequirements:\n• 5+ years of software development experience\n• Strong knowledge of React, Node.js, and TypeScript\n• Experience with cloud platforms (AWS/GCP)\n• Excellent problem-solving skills',
    recruiterName: 'Sarah Johnson',
    salaryUSD: { min: 50000, max: 80000 },
    currencyType: 'USD',
    isVerified: true,
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Problem Solving'],
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Innovation Hub',
    location: 'Lagos, Nigeria',
    salary: '$60,000 - $90,000',
    type: 'Full-time',
    postedDate: '5 days ago',
    description: 'Lead product strategy and development for our mobile platform. As a Product Manager, you will define the product vision, create roadmaps, and work closely with engineering and design teams to deliver exceptional user experiences. This is a key leadership role with significant impact on company growth.\n\nResponsibilities:\n• Define product strategy and roadmap\n• Conduct user research and market analysis\n• Prioritize features and manage product backlog\n• Work with stakeholders to align on goals\n\nQualifications:\n• 3+ years in product management\n• Experience with mobile products\n• Strong analytical and communication skills\n• Data-driven decision making',
    recruiterName: 'Michael Chen',
    salaryUSD: { min: 60000, max: 90000 },
    currencyType: 'local',
    isVerified: true,
    requiredSkills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis', 'Leadership'],
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'Creative Studios',
    location: 'Nairobi, Kenya',
    salary: '$40,000 - $65,000',
    type: 'Full-time',
    postedDate: '1 week ago',
    description: 'Design beautiful and intuitive user experiences for our products. Join our creative team and help shape the future of digital experiences for African users. You will work on diverse projects spanning mobile apps, web platforms, and enterprise software.\n\nWhat You\'ll Do:\n• Create wireframes, prototypes, and high-fidelity designs\n• Conduct user research and usability testing\n• Collaborate with developers to ensure design quality\n• Maintain design systems and style guides\n\nRequirements:\n• 3+ years of UI/UX design experience\n• Proficiency in Figma, Sketch, or Adobe XD\n• Strong portfolio demonstrating your work\n• Understanding of mobile-first design principles',
    recruiterName: 'Emma Thompson',
    salaryUSD: { min: 40000, max: 65000 },
    currencyType: 'local',
    isVerified: false,
    requiredSkills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Mobile Design'],
  },
  {
    id: '4',
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Cape Town, South Africa',
    salary: '$45,000 - $70,000',
    type: 'Full-time',
    postedDate: '3 days ago',
    description: 'Analyze data and provide insights to drive business decisions. Work with large datasets to uncover trends, build dashboards, and help stakeholders make informed decisions. This role is perfect for someone who loves working with data and telling stories through analytics.\n\nKey Duties:\n• Analyze complex datasets and extract actionable insights\n• Create reports and dashboards for stakeholders\n• Build predictive models and forecasts\n• Collaborate with teams across the organization\n\nSkills Needed:\n• 2+ years in data analysis\n• Proficiency in SQL, Python, or R\n• Experience with BI tools (Tableau, Power BI)\n• Strong statistical knowledge',
    recruiterName: 'David Martinez',
    salaryUSD: { min: 45000, max: 70000 },
    currencyType: 'local',
    isVerified: true,
    requiredSkills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Excel'],
  },
  {
    id: '5',
    title: 'Marketing Manager',
    company: 'Brand Builders',
    location: 'Kigali, Rwanda',
    salary: '$50,000 - $75,000',
    type: 'Full-time',
    postedDate: '4 days ago',
    description: 'Develop and execute marketing strategies to grow our brand across African markets. Lead marketing campaigns, manage budgets, and drive customer acquisition. This role combines creativity with data-driven strategy to achieve business goals.\n\nMain Responsibilities:\n• Develop comprehensive marketing strategies\n• Manage digital marketing campaigns\n• Analyze campaign performance and optimize ROI\n• Lead a team of marketing professionals\n• Build partnerships with key stakeholders\n\nRequired Experience:\n• 4+ years in marketing management\n• Proven track record of successful campaigns\n• Experience with digital marketing tools\n• Strong leadership and communication skills',
    recruiterName: 'Lisa Anderson',
    salaryUSD: { min: 50000, max: 75000 },
    currencyType: 'USD',
    isVerified: false,
    requiredSkills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Team Management'],
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
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const { data: user } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const { data: postedJobs = [] } = useQuery({
    queryKey: ['postedJobs'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('postedJobs');
      return stored ? JSON.parse(stored) : [];
    },
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('applications');
      return stored ? JSON.parse(stored) : [];
    },
  });

  const getApplicationCount = (jobId: string) => {
    return allApplications.filter((app: any) => app.jobId === jobId).length;
  };

  const filteredJobs = useMemo(
    () =>
      MOCK_JOBS.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
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
        {(user?.userType === 'recruiter' || user?.userType === 'company') && (
          <Pressable
            style={({ pressed }) => [
              styles.postJobButton,
              pressed && styles.postJobButtonPressed,
            ]}
            onPress={() => router.push('/post-job')}
          >
            <Plus color={Colors.white} size={20} strokeWidth={3} />
            <Text style={styles.postJobButtonText}>Post a Job</Text>
          </Pressable>
        )}

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

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsLabel}>Required Skills:</Text>
                  <View style={styles.skillsWrapper}>
                    {job.requiredSkills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <Pressable
                onPress={() =>
                  setExpandedJobId(expandedJobId === job.id ? null : job.id)
                }
              >
                <Text
                  style={styles.jobDescription}
                  numberOfLines={expandedJobId === job.id ? undefined : 3}
                >
                  {job.description}
                </Text>
                {job.description.length > 150 && (
                  <View style={styles.expandButton}>
                    <Text style={styles.expandButtonText}>
                      {expandedJobId === job.id ? 'Show less' : 'Read more'}
                    </Text>
                    {expandedJobId === job.id ? (
                      <ChevronUp color={Colors.primary} size={16} />
                    ) : (
                      <ChevronDown color={Colors.primary} size={16} />
                    )}
                  </View>
                )}
              </Pressable>

              <View style={styles.jobActions}>
                {(user?.userType === 'recruiter' || user?.userType === 'company') &&
                postedJobs.some((pj: any) => pj.id === job.id) ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.viewApplicationsButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: '/manage-applications',
                        params: {
                          jobId: job.id,
                          jobTitle: job.title,
                        },
                      })
                    }
                  >
                    <Users color={Colors.white} size={20} />
                    <Text style={styles.viewApplicationsButtonText}>
                      View Applications ({getApplicationCount(job.id)})
                    </Text>
                  </Pressable>
                ) : user?.userType === 'professional' ? (
                  <>
                    <Pressable
                      style={({ pressed }) => [
                        styles.applyButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: '/apply-job',
                          params: {
                            jobId: job.id,
                            jobTitle: job.title,
                            company: job.company,
                          },
                        })
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
                  </>
                ) : null}
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
  viewApplicationsButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  viewApplicationsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  postJobButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    margin: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  postJobButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  postJobButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  expandButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
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
  skillsContainer: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: Colors.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
