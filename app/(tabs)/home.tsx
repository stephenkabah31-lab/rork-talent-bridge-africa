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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

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
  { id: '2', icon: Users, label: 'Network', color: Colors.secondary, route: '/network' as const },
  { id: '3', icon: Building2, label: 'Companies', color: Colors.accent, route: '/home' as const },
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
