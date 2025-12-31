import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Users,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  Plus,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    title: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: {
      id: 'u1',
      name: 'Amara Okafor',
      title: 'Talent Acquisition Lead',
      isVerified: true,
    },
    content:
      'We are looking for talented software developers to join our growing team. Multiple positions available across West Africa. Competitive compensation and growth opportunities. Reach out if interested! 🚀\n\n#TechJobs #AfricaTech #Careers',
    timestamp: '2h ago',
    likes: 234,
    comments: 45,
    shares: 12,
    isLiked: false,
  },
  {
    id: '2',
    author: {
      id: 'u2',
      name: 'Kwame Mensah',
      title: 'Product Strategy Consultant',
    },
    content:
      'Had an amazing session with entrepreneurs discussing digital innovation strategies. The talent and creativity in Africa continues to impress! 🌍\n\nReminder: Focus on solving real problems for your users first.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    timestamp: '4h ago',
    likes: 567,
    comments: 89,
    shares: 34,
    isLiked: true,
  },
  {
    id: '3',
    author: {
      id: 'u3',
      name: 'Zainab Hassan',
      title: 'Design Lead | Digital Agency',
      isVerified: true,
    },
    content:
      'Design insight: Consistency creates trust! 🎨\n\nWhen working on digital products, maintaining consistent patterns helps users feel comfortable and confident. Small details make a big difference.\n\nWhat design principles do you follow?',
    timestamp: '6h ago',
    likes: 892,
    comments: 156,
    shares: 67,
    isLiked: false,
  },
  {
    id: '4',
    author: {
      id: 'u4',
      name: 'AfriTech Solutions',
      title: 'Technology Company',
      isVerified: true,
    },
    content:
      '🎉 Exciting news! We have secured significant funding for expansion across African markets. This enables us to create hundreds of new opportunities for talented professionals.\n\nGrateful to everyone who supported this milestone. Onward! 💪',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800',
    timestamp: '1d ago',
    likes: 3241,
    comments: 428,
    shares: 231,
    isLiked: true,
  },
];

const QUICK_ACTIONS = [
  { id: '1', icon: Briefcase, label: 'Jobs', color: Colors.primary, route: '/jobs' as const },
  { id: '2', icon: Users, label: 'Network', color: Colors.secondary, route: '/people-search' as const },
  { id: '3', icon: Building2, label: 'Companies', color: Colors.accent, route: '/connections' as const },
  { id: '4', icon: TrendingUp, label: 'Premium', color: Colors.warning, route: '/subscription' as const },
];

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [refreshing, setRefreshing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const isRecruiterOrCompany = user?.type === 'recruiter' || user?.type === 'company';

  if (isRecruiterOrCompany) {
    return <RecruiterCompanyView user={user} />;
  }

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Pressable
          style={styles.authorInfo}
          onPress={() => router.push({ pathname: '/user-profile', params: { userId: item.author.id } })}
        >
          <View style={styles.avatar}>
            {item.author.profilePicture ? (
              <Image source={{ uri: item.author.profilePicture }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.author.name.charAt(0)}</Text>
              </View>
            )}
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.authorTitle}>{item.author.title}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </Pressable>
        <Pressable style={styles.moreButton}>
          <MoreHorizontal color={Colors.textLight} size={20} />
        </Pressable>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} contentFit="cover" />
      )}

      <View style={styles.postStats}>
        <Text style={styles.statText}>{item.likes} likes</Text>
        <View style={styles.statRight}>
          <Text style={styles.statText}>{item.comments} comments</Text>
          <Text style={styles.statText}>•</Text>
          <Text style={styles.statText}>{item.shares} shares</Text>
        </View>
      </View>

      <View style={styles.postActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Heart
            color={item.isLiked ? Colors.error : Colors.textLight}
            size={20}
            fill={item.isLiked ? Colors.error : 'transparent'}
          />
          <Text style={[styles.actionText, item.isLiked && styles.actionTextActive]}>
            Like
          </Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <MessageCircle color={Colors.textLight} size={20} />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Repeat2 color={Colors.textLight} size={20} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Send color={Colors.textLight} size={20} />
          <Text style={styles.actionText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TalentBridge</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <Pressable
              style={styles.createPost}
              onPress={() => router.push('/create-post')}
            >
              <View style={styles.avatar}>
                {user?.profilePicture ? (
                  <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {user?.fullName?.charAt(0) || user?.companyName?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.createPostText}>Share something with your network...</Text>
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickActions}
              contentContainerStyle={styles.quickActionsContent}
            >
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.id}
                  style={({ pressed }) => [
                    styles.quickActionButton,
                    pressed && styles.quickActionPressed,
                  ]}
                  onPress={() => router.push(action.route)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                    <action.icon color={action.color} size={24} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.sectionDivider} />
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  createPost: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createPostText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textLight,
  },
  quickActions: {
    backgroundColor: Colors.white,
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionsContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: Colors.light,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: Colors.white,
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  authorTitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statText: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
  },
  statRight: {
    flexDirection: 'row',
    gap: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  actionTextActive: {
    color: Colors.error,
  },
});

interface RecruiterUser {
  id: string;
  email: string;
  type: 'recruiter' | 'company';
  fullName?: string;
  companyName?: string;
}

function RecruiterCompanyView({ user }: { user: RecruiterUser }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const jobsQuery = trpc.jobs.getAll.useQuery({ filter: 'all' });
  const postedJobs = jobsQuery.data?.filter(job => job.postedBy === user.id) || [];

  const applicationsQuery = trpc.jobs.getApplications.useQuery({});
  const allApplications = applicationsQuery.data || [];
  
  const myJobApplications = allApplications.filter(app => {
    const job = postedJobs.find(j => j.id === app.jobId);
    return job !== undefined;
  });

  const pendingCount = myJobApplications.filter(app => app.status === 'pending').length;
  const reviewingCount = myJobApplications.filter(app => app.status === 'reviewing').length;
  const shortlistedCount = myJobApplications.filter(app => app.status === 'shortlisted').length;

  const onRefresh = () => {
    setRefreshing(true);
    jobsQuery.refetch();
    applicationsQuery.refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const isLoading = jobsQuery.isLoading || applicationsQuery.isLoading;

  return (
    <SafeAreaView style={recruiterStyles.container} edges={['top']}>
      <View style={recruiterStyles.header}>
        <Text style={recruiterStyles.headerTitle}>Dashboard</Text>
        <Pressable
          style={recruiterStyles.postJobButton}
          onPress={() => router.push('/post-job')}
        >
          <Plus color={Colors.white} size={20} />
          <Text style={recruiterStyles.postJobText}>Post Job</Text>
        </Pressable>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={recruiterStyles.statsContainer}>
          <View style={recruiterStyles.statCard}>
            <View style={[recruiterStyles.statIcon, { backgroundColor: `${Colors.primary}20` }]}>
              <Briefcase color={Colors.primary} size={24} />
            </View>
            <Text style={recruiterStyles.statValue}>{postedJobs.length}</Text>
            <Text style={recruiterStyles.statLabel}>Active Jobs</Text>
          </View>

          <View style={recruiterStyles.statCard}>
            <View style={[recruiterStyles.statIcon, { backgroundColor: `${Colors.warning}20` }]}>
              <Clock color={Colors.warning} size={24} />
            </View>
            <Text style={recruiterStyles.statValue}>{pendingCount}</Text>
            <Text style={recruiterStyles.statLabel}>Pending</Text>
          </View>

          <View style={recruiterStyles.statCard}>
            <View style={[recruiterStyles.statIcon, { backgroundColor: `${Colors.secondary}20` }]}>
              <FileText color={Colors.secondary} size={24} />
            </View>
            <Text style={recruiterStyles.statValue}>{reviewingCount}</Text>
            <Text style={recruiterStyles.statLabel}>Reviewing</Text>
          </View>

          <View style={recruiterStyles.statCard}>
            <View style={[recruiterStyles.statIcon, { backgroundColor: `${Colors.success}20` }]}>
              <CheckCircle color={Colors.success} size={24} />
            </View>
            <Text style={recruiterStyles.statValue}>{shortlistedCount}</Text>
            <Text style={recruiterStyles.statLabel}>Shortlisted</Text>
          </View>
        </View>

        <View style={recruiterStyles.section}>
          <View style={recruiterStyles.sectionHeader}>
            <Text style={recruiterStyles.sectionTitle}>Recent Applications</Text>
            <Pressable onPress={() => router.push('/manage-applications')}>
              <Text style={recruiterStyles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={recruiterStyles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : myJobApplications.length === 0 ? (
            <View style={recruiterStyles.emptyState}>
              <FileText color={Colors.textLight} size={48} />
              <Text style={recruiterStyles.emptyTitle}>No Applications Yet</Text>
              <Text style={recruiterStyles.emptyText}>
                Applications from candidates will appear here
              </Text>
              <Pressable
                style={recruiterStyles.emptyButton}
                onPress={() => router.push('/post-job')}
              >
                <Text style={recruiterStyles.emptyButtonText}>Post Your First Job</Text>
              </Pressable>
            </View>
          ) : (
            <View style={recruiterStyles.applicationsList}>
              {myJobApplications.slice(0, 5).map((application) => {
                const job = postedJobs.find(j => j.id === application.jobId);
                return (
                  <Pressable
                    key={application.id}
                    style={recruiterStyles.applicationCard}
                    onPress={() => router.push('/manage-applications')}
                  >
                    <View style={recruiterStyles.applicationHeader}>
                      <View style={recruiterStyles.applicationInfo}>
                        <Text style={recruiterStyles.applicantName}>Applicant ID: {application.userId.slice(0, 8)}</Text>
                        <Text style={recruiterStyles.jobTitle}>{job?.title || 'Unknown Job'}</Text>
                        <Text style={recruiterStyles.applicationDate}>
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={[
                        recruiterStyles.statusBadge,
                        application.status === 'pending' && recruiterStyles.statusPending,
                        application.status === 'reviewing' && recruiterStyles.statusReviewing,
                        application.status === 'shortlisted' && recruiterStyles.statusShortlisted,
                        application.status === 'accepted' && recruiterStyles.statusAccepted,
                        application.status === 'rejected' && recruiterStyles.statusRejected,
                      ]}>
                        <Text style={recruiterStyles.statusText}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={recruiterStyles.section}>
          <View style={recruiterStyles.sectionHeader}>
            <Text style={recruiterStyles.sectionTitle}>Posted Jobs</Text>
            <Pressable onPress={() => router.push('/jobs')}>
              <Text style={recruiterStyles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          {postedJobs.length === 0 ? (
            <View style={recruiterStyles.emptyState}>
              <Briefcase color={Colors.textLight} size={48} />
              <Text style={recruiterStyles.emptyTitle}>No Jobs Posted</Text>
              <Text style={recruiterStyles.emptyText}>
                Start posting jobs to find great candidates
              </Text>
            </View>
          ) : (
            <View style={recruiterStyles.jobsList}>
              {postedJobs.slice(0, 3).map((job) => (
                <Pressable
                  key={job.id}
                  style={recruiterStyles.jobCard}
                  onPress={() => router.push('/jobs')}
                >
                  <View style={recruiterStyles.jobHeader}>
                    <Text style={recruiterStyles.jobTitle}>{job.title}</Text>
                    <Text style={recruiterStyles.jobType}>{job.type}</Text>
                  </View>
                  <Text style={recruiterStyles.jobCompany}>{job.company}</Text>
                  <Text style={recruiterStyles.jobLocation}>{job.location}</Text>
                  <View style={recruiterStyles.jobFooter}>
                    <Text style={recruiterStyles.applicantsCount}>
                      {job.applicants} {job.applicants === 1 ? 'applicant' : 'applicants'}
                    </Text>
                    <Text style={recruiterStyles.jobPosted}>
                      Posted {new Date(job.postedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const recruiterStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  postJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postJobText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  applicationsList: {
    gap: 12,
  },
  applicationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  applicationInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: `${Colors.warning}20`,
  },
  statusReviewing: {
    backgroundColor: `${Colors.secondary}20`,
  },
  statusShortlisted: {
    backgroundColor: `${Colors.success}20`,
  },
  statusAccepted: {
    backgroundColor: `${Colors.success}40`,
  },
  statusRejected: {
    backgroundColor: `${Colors.error}20`,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobType: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jobCompany: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applicantsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  jobPosted: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
