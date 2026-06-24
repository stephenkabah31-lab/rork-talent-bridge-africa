import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Bell, Briefcase, Heart, MessageCircle, UserPlus } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function NotificationsScreen() {
  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const { data: notifications = [], isLoading } = trpc.notifications.getByUser.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user },
  );

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
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center', gap: 12 }}>
            <Bell color={Colors.textLight} size={48} />
            <Text style={{ fontSize: 16, color: Colors.textLight }}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notification: any) => (
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
            {!notification.read && <View style={styles.unreadDot} />}
          </Pressable>
        )))}
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
