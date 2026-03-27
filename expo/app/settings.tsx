import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  Bell,
  Lock,
  Eye,
  Globe,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  Moon,
  User,
  Mail,
  Phone,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.multiRemove(['user', 'authToken']);
      await queryClient.clear();
    },
    onSuccess: () => {
      router.replace('/' as any);
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logoutMutation.mutate(),
        },
      ],
      { cancelable: true }
    );
  };

  const accountSettings = [
    {
      id: '1',
      icon: User,
      label: 'Account Information',
      description: 'Update your personal details',
      route: '/profile',
      color: Colors.primary,
    },
    {
      id: '2',
      icon: Mail,
      label: 'Email & Password',
      description: 'Manage your login credentials',
      route: null,
      color: Colors.secondary,
    },
    {
      id: '3',
      icon: Phone,
      label: 'Phone Number',
      description: 'Update your contact number',
      route: null,
      color: Colors.accent,
    },
  ];

  const privacySettings = [
    {
      id: '1',
      icon: Lock,
      label: 'Privacy',
      description: 'Control who can see your profile',
      route: null,
      color: Colors.primary,
    },
    {
      id: '2',
      icon: Eye,
      label: 'Data & Analytics',
      description: 'Manage data collection preferences',
      route: null,
      color: Colors.secondary,
    },
    {
      id: '3',
      icon: Shield,
      label: 'Security',
      description: 'Two-factor authentication & more',
      route: null,
      color: Colors.accent,
    },
  ];

  const appSettings = [
    {
      id: '1',
      icon: Globe,
      label: 'Language',
      description: 'English',
      route: null,
      color: Colors.primary,
    },
    {
      id: '2',
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help with your account',
      route: null,
      color: Colors.secondary,
    },
    {
      id: '3',
      icon: FileText,
      label: 'Terms of Service',
      description: 'View our terms and conditions',
      route: '/terms',
      color: Colors.accent,
    },
    {
      id: '4',
      icon: Shield,
      label: 'Privacy Policy',
      description: 'View our privacy policy',
      route: '/privacy',
      color: Colors.primary,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          {accountSettings.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed,
              ]}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                } else {
                  Alert.alert('Coming Soon', 'This feature is under development');
                }
              }}
            >
              <View
                style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}
              >
                <item.icon color={item.color} size={20} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
              </View>
              <ChevronRight color={Colors.textLight} size={20} />
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.settingItem}>
            <View
              style={[styles.settingIcon, { backgroundColor: `${Colors.primary}20` }]}
            >
              <Bell color={Colors.primary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View
              style={[styles.settingIcon, { backgroundColor: `${Colors.secondary}20` }]}
            >
              <Mail color={Colors.secondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive updates via email
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
          {privacySettings.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed,
              ]}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                } else {
                  Alert.alert('Coming Soon', 'This feature is under development');
                }
              }}
            >
              <View
                style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}
              >
                <item.icon color={item.color} size={20} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
              </View>
              <ChevronRight color={Colors.textLight} size={20} />
            </Pressable>
          ))}

          <View style={styles.settingItem}>
            <View
              style={[styles.settingIcon, { backgroundColor: `${Colors.accent}20` }]}
            >
              <Eye color={Colors.accent} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Profile Visibility</Text>
              <Text style={styles.settingDescription}>
                Make your profile visible to recruiters
              </Text>
            </View>
            <Switch
              value={profileVisibility}
              onValueChange={setProfileVisibility}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP SETTINGS</Text>
          <View style={styles.settingItem}>
            <View
              style={[styles.settingIcon, { backgroundColor: `${Colors.dark}20` }]}
            >
              <Moon color={Colors.dark} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Coming soon</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
              disabled
            />
          </View>

          {appSettings.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed,
              ]}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                } else {
                  Alert.alert('Coming Soon', 'This feature is under development');
                }
              }}
            >
              <View
                style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}
              >
                <item.icon color={item.color} size={20} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
              </View>
              <ChevronRight color={Colors.textLight} size={20} />
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              styles.logoutItem,
              pressed && styles.settingItemPressed,
            ]}
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <View
              style={[styles.settingIcon, { backgroundColor: `${Colors.error}20` }]}
            >
              {logoutMutation.isPending ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <LogOut color={Colors.error} size={20} />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, styles.logoutText]}>
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Text>
              <Text style={styles.settingDescription}>
                Sign out of your account
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TalentBridge v1.0.0</Text>
          <Text style={styles.footerText}>
            User ID: {user?.id || 'Not available'}
          </Text>
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
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textLight,
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItemPressed: {
    backgroundColor: Colors.light,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textLight,
  },
  logoutItem: {
    backgroundColor: Colors.white,
  },
  logoutText: {
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});