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
  Check,
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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import { LANGUAGES } from '@/lib/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

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
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setLanguageModalVisible(false);
    Alert.alert(
      t('common.done'),
      t('settings.languageChanged'),
    );
  };

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
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout'),
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
      label: t('settings.accountInfo'),
      description: t('settings.updatePersonalDetails'),
      route: '/profile',
      color: Colors.primary,
    },
    {
      id: '2',
      icon: Mail,
      label: t('settings.emailPassword'),
      description: t('settings.manageLoginCredentials'),
      route: null,
      color: Colors.secondary,
    },
    {
      id: '3',
      icon: Phone,
      label: t('settings.phoneNumberSetting'),
      description: t('settings.updateContactNumber'),
      route: null,
      color: Colors.accent,
    },
  ];

  const privacySettings = [
    {
      id: '1',
      icon: Lock,
      label: t('settings.privacySetting'),
      description: t('settings.privacySettingDesc'),
      route: null,
      color: Colors.primary,
    },
    {
      id: '2',
      icon: Eye,
      label: t('settings.dataAnalytics'),
      description: t('settings.dataAnalyticsDesc'),
      route: null,
      color: Colors.secondary,
    },
    {
      id: '3',
      icon: Shield,
      label: t('settings.security'),
      description: t('settings.securityDesc'),
      route: null,
      color: Colors.accent,
    },
  ];

  const appSettings = [
    {
      id: '1',
      icon: Globe,
      label: t('settings.languageSetting'),
      description: currentLanguage.native,
      route: null,
      color: Colors.primary,
      isLanguage: true,
    },
    {
      id: '2',
      icon: HelpCircle,
      label: t('nav.help'),
      description: 'Get help with your account',
      route: null,
      color: Colors.secondary,
    },
    {
      id: '3',
      icon: FileText,
      label: t('settings.termsOfService'),
      description: t('settings.termsDesc'),
      route: '/terms',
      color: Colors.accent,
    },
    {
      id: '4',
      icon: Shield,
      label: t('settings.privacyPolicy'),
      description: t('settings.privacyPolicyDesc'),
      route: '/privacy',
      color: Colors.primary,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account').toUpperCase()}</Text>
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
                  Alert.alert(t('common.comingSoon'), t('common.underDevelopment'));
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
          <Text style={styles.sectionTitle}>{t('settings.notifications').toUpperCase()}</Text>
          <View style={styles.settingItem}>
            <View
              style={[styles.settingIcon, { backgroundColor: `${Colors.primary}20` }]}
            >
              <Bell color={Colors.primary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.pushNotifications')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.pushNotificationsDesc')}
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
              <Text style={styles.settingLabel}>{t('settings.emailNotifications')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.emailNotificationsDesc')}
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
          <Text style={styles.sectionTitle}>{t('settings.privacySecurity').toUpperCase()}</Text>
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
                  Alert.alert(t('common.comingSoon'), t('common.underDevelopment'));
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
              <Text style={styles.settingLabel}>{t('settings.profileVisibility')}</Text>
              <Text style={styles.settingDescription}>
                {t('settings.profileVisibilityDesc')}
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
          <Text style={styles.sectionTitle}>{t('settings.appSettings').toUpperCase()}</Text>
          <View style={styles.settingItem}>
            <View
              style={[styles.settingIcon, { backgroundColor: `${Colors.dark}20` }]}
            >
              <Moon color={Colors.dark} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.darkMode')}</Text>
              <Text style={styles.settingDescription}>{t('common.comingSoon')}</Text>
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
                if ((item as any).isLanguage) {
                  setLanguageModalVisible(true);
                } else if (item.route) {
                  router.push(item.route as any);
                } else {
                  Alert.alert(t('common.comingSoon'), t('common.underDevelopment'));
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
          <Text style={styles.sectionTitle}>{t('settings.accountActions').toUpperCase()}</Text>
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
                {logoutMutation.isPending ? t('auth.loggingOut') : t('auth.logout')}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.signOut')}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('settings.version')}</Text>
          <Text style={styles.footerText}>
            {t('settings.userId')}: {user?.id || t('common.none')}
          </Text>
          <Text style={styles.footerText}>{t('settings.copyright')}</Text>
        </View>
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('settings.chooseLanguage')}</Text>
            <Pressable
              onPress={() => setLanguageModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </Pressable>
          </View>
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const isActive = i18n.language === item.code;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.languageItem,
                    pressed && styles.settingItemPressed,
                  ]}
                  onPress={() => handleLanguageChange(item.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageNative}>{item.native}</Text>
                    <Text style={styles.languageLabel}>{item.label}</Text>
                  </View>
                  {isActive && <Check color={Colors.primary} size={22} />}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  languageInfo: {
    flex: 1,
    gap: 4,
  },
  languageNative: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  languageLabel: {
    fontSize: 13,
    color: Colors.textLight,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 20,
  },
});
