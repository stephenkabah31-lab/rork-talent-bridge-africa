import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Settings,
  Briefcase,
  Users,
  MessageCircle,
  Crown,
  ChevronRight,
  Edit,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

export default function MeScreen() {
  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const menuItems = [
    {
      id: '1',
      icon: Edit,
      label: 'Edit Profile',
      route: '/profile',
      color: Colors.primary,
    },
    {
      id: '2',
      icon: Briefcase,
      label: 'Jobs',
      route: '/jobs',
      color: Colors.secondary,
    },
    {
      id: '3',
      icon: Users,
      label: 'My Network',
      route: '/connections',
      color: Colors.accent,
    },
    {
      id: '4',
      icon: MessageCircle,
      label: 'Messages',
      route: '/messages',
      color: Colors.warning,
    },
    {
      id: '5',
      icon: Crown,
      label: 'Premium Subscription',
      route: '/subscription',
      color: Colors.primary,
    },
    {
      id: '6',
      icon: Settings,
      label: 'Settings',
      route: '/settings',
      color: Colors.textLight,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.fullName?.charAt(0) || user?.companyName?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>
            {user?.fullName || user?.companyName || 'User Name'}
          </Text>
          <Text style={styles.title}>
            {user?.profession || user?.industry || 'Professional'}
          </Text>

          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Crown color={Colors.primary} size={16} />
              <Text style={styles.premiumText}>Premium Member</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>342</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>28</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>1.2K</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                <item.icon color={item.color} size={20} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight color={Colors.textLight} size={20} />
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TalentBridge v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 TalentBridge</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  premiumText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemPressed: {
    backgroundColor: Colors.light,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
