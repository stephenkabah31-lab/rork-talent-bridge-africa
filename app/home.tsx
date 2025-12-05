import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Building2, Crown, Search, User } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface UserData {
  userType: 'professional' | 'recruiter' | 'company';
  fullName?: string;
  companyName?: string;
  email: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: user } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const getUserIcon = () => {
    switch (user?.userType) {
      case 'professional':
        return <User color={Colors.primary} size={32} />;
      case 'recruiter':
        return <Search color={Colors.secondary} size={32} />;
      case 'company':
        return <Building2 color={Colors.accent} size={32} />;
      default:
        return <User color={Colors.primary} size={32} />;
    }
  };

  const getUserTypeName = () => {
    switch (user?.userType) {
      case 'professional':
        return 'Professional';
      case 'recruiter':
        return 'Recruiter';
      case 'company':
        return 'Company';
      default:
        return 'User';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeCard}>
            <View style={styles.iconCircle}>{getUserIcon()}</View>
            <Text style={styles.welcomeTitle}>Welcome to TalentBridge!</Text>
            <Text style={styles.welcomeSubtitle}>
              {user?.fullName || user?.companyName || 'User'}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getUserTypeName()}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.premiumBanner,
              pressed && styles.premiumBannerPressed,
            ]}
            onPress={() => router.push('/subscription')}
          >
            <View style={styles.premiumIcon}>
              <Crown color={Colors.primary} size={28} strokeWidth={2} />
            </View>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumDescription}>
                Unlock all features and accelerate your success
              </Text>
            </View>
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get Started</Text>
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.cardTitle}>Complete Your Profile</Text>
              <Text style={styles.cardDescription}>
                Add more information to help others find and connect with you
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push('/jobs')}
            >
              <Text style={styles.cardTitle}>
                {user?.userType === 'professional'
                  ? 'Search Jobs (Free Access)'
                  : 'Find Talent'}
              </Text>
              <Text style={styles.cardDescription}>
                {user?.userType === 'professional'
                  ? 'Browse jobs and apply for free. Upgrade to message recruiters directly.'
                  : 'Search for qualified professionals for your positions'}
              </Text>
            </Pressable>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Build Your Network</Text>
              <Text style={styles.cardDescription}>
                Connect with professionals across Africa to expand your reach
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Building Africa&apos;s professional future, one connection at a time
            </Text>
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
  scrollContent: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  premiumBanner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumBannerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  premiumIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
