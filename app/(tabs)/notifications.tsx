import { useRouter } from 'expo-router';
import { Bell, Briefcase, Heart, MessageCircle, UserPlus } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'job';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'Sarah Johnson liked your post',
    description: 'Your post about mobile development received a like',
    time: '2h ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'connection',
    title: 'Michael Chen accepted your connection',
    description: 'You are now connected with Michael Chen',
    time: '5h ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'comment',
    title: 'Emma Thompson commented on your post',
    description: '"Great insights! Thanks for sharing."',
    time: '1d ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'job',
    title: 'New job matches your profile',
    description: 'Senior Software Engineer at Tech Africa',
    time: '2d ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'connection',
    title: 'David Martinez wants to connect',
    description: 'Accept connection request',
    time: '3d ago',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart color={Colors.error} size={24} fill={Colors.error} />;
      case 'comment':
        return <MessageCircle color={Colors.primary} size={24} />;
      case 'connection':
        return <UserPlus color={Colors.secondary} size={24} />;
      case 'job':
        return <Briefcase color={Colors.warning} size={24} />;
      default:
        return <Bell color={Colors.textLight} size={24} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {MOCK_NOTIFICATIONS.map((notification) => (
          <Pressable
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.isRead && styles.notificationCardUnread,
            ]}
            onPress={() => {
              if (notification.type === 'job') {
                router.push('/jobs');
              }
            }}
          >
            <View style={styles.iconContainer}>{getIcon(notification.type)}</View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationDescription}>
                {notification.description}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            {!notification.isRead && <View style={styles.unreadDot} />}
          </Pressable>
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
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationCardUnread: {
    backgroundColor: '#FFF9E6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
});
