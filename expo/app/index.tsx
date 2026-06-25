import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Building2,
  Heart,
  Target,
  Users,
} from 'lucide-react-native';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';

const PROJECT_ID = 'ln0w2dnjwy17g62tuteow';
const rorkAsset = (key: string) =>
  `https://rork.app/pa/${PROJECT_ID}/${key}`;

const howItWorksCards = [
  {
    icon: Target,
    titleKey: 'landing.forProfessionals',
    descKey: 'landing.forProfessionalsDesc',
    color: '#D97706',
    image: 'a_young_african',
    route: '/signup-professional',
  },
  {
    icon: Users,
    titleKey: 'landing.forRecruiters',
    descKey: 'landing.forRecruitersDesc',
    color: '#059669',
    image: 'female_recruiter_at_desk',
    route: '/signup-recruiter',
  },
  {
    icon: Building2,
    titleKey: 'landing.forCompanies',
    descKey: 'landing.forCompaniesDesc',
    color: '#7C3AED',
    image: 'glass_tower_african_city',
    route: '/signup-company',
  },
];

export default function IndexRedirect() {
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);

  const checkUserStatus = React.useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.isAdmin) {
          router.replace('/admin-dashboard' as any);
        } else {
          router.replace('/(tabs)/home' as any);
        }
      } else {
        setIsChecking(false);
      }
    } catch {
      setIsChecking(false);
    }
  }, [router]);

  React.useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  if (isChecking) {
    return (
      <View style={styles.splashContainer} />
    );
  }

  return <WelcomeScreen />;
}

function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ── */}
        <View style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                {t('landing.heroTitle', "Africa's professional network for finding work and hiring talent")}
              </Text>
              <Text style={styles.heroSubtitle}>
                {t('landing.heroSubtitle', "Connect with professionals, browse live job listings, message recruiters directly, and land your next role — all in one place.")}
              </Text>
              <View style={styles.heroButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => router.push('/user-type' as any)}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryBtnGradient}
                  >
                    <Text style={styles.primaryBtnText}>
                      {t('landing.joinNow')} <ArrowRight size={16} color="#fff" style={{ marginLeft: 4 }} />
                    </Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.outlineBtn,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => router.push('/jobs' as any)}
                >
                  <Text style={styles.outlineBtnText}>
                    {t('landing.browseJobs', 'Browse Jobs')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* ── AFRICA NETWORK MAP ── */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>{t('landing.africaNetwork')}</Text>
          <View style={styles.mapContainer}>
            <Image
              source={{ uri: rorkAsset('africa_network_map') }}
              style={styles.mapImage}
              resizeMode="contain"
            />
            {/* City labels overlaid */}
            <Text style={[styles.cityLabel, { top: '6%', left: '46%' }]}>Cairo</Text>
            <Text style={[styles.cityLabel, { top: '27%', left: '5%' }]}>Dakar</Text>
            <Text style={[styles.cityLabel, { top: '37%', left: '33%' }]}>Lagos</Text>
            <Text style={[styles.cityLabel, { top: '32%', left: '60%' }]}>Nairobi</Text>
            <Text style={[styles.cityLabel, { top: '41%', left: '50%' }]}>Kinshasa</Text>
            <Text style={[styles.cityLabel, { top: '67%', left: '46%' }]}>Johannesburg</Text>
            <Text style={[styles.cityLabel, { top: '72%', left: '37%' }]}>Cape Town</Text>
            <Text style={[styles.cityLabel, { top: '16%', left: '63%' }]}>Addis Ababa</Text>
            <Text style={[styles.cityLabel, { top: '13%', left: '26%' }]}>Casablanca</Text>
            <Text style={[styles.cityLabel, { top: '43%', left: '18%' }]}>Accra</Text>
            <Text style={[styles.cityLabel, { top: '47%', left: '66%' }]}>Dar es Salaam</Text>
          </View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <View style={styles.howSection}>
          <Text style={styles.sectionTitle}>{t('landing.howItWorks')}</Text>

          {howItWorksCards.map((card) => (
            <Pressable
              key={card.titleKey}
              style={({ pressed }) => [
                styles.howCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(card.route as any)}
            >
              <Image
                source={{ uri: rorkAsset(card.image) }}
                style={styles.howCardImage}
                resizeMode="cover"
              />
              <View style={styles.howCardBody}>
                <View
                  style={[
                    styles.howCardIcon,
                    { backgroundColor: `${card.color}18` },
                  ]}
                >
                  <card.icon color={card.color} size={20} />
                </View>
                <Text style={styles.howCardTitle}>{t(card.titleKey)}</Text>
                <Text style={styles.howCardDesc}>{t(card.descKey)}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── CTA ── */}
        <LinearGradient
          colors={[Colors.primary, '#9A3412']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaTitle}>
            {t('landing.ctaTitle', 'Ready to take the next step?')}
          </Text>
          <Text style={styles.ctaSubtitle}>
            {t('landing.ctaSubtitle', "Join thousands of professionals already using TalentBridge to find opportunities and grow their careers across Africa.")}
          </Text>
          <View style={styles.ctaButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.ctaPrimaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() => router.push('/user-type' as any)}
            >
              <Text style={styles.ctaPrimaryBtnText}>
                {t('landing.createFreeAccount')}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.ctaOutlineBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() => router.push('/login' as any)}
            >
              <Text style={styles.ctaOutlineBtnText}>
                {t('landing.signIn')}
              </Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            Talent<Text style={styles.footerBrandAccent}>Bridge</Text>
          </Text>
          <View style={styles.footerLinks}>
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/terms' as any)}
            >
              Terms
            </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/privacy' as any)}
            >
              Privacy
            </Text>
          </View>
          <Text style={styles.footerCopy}>
            <Heart size={10} color={Colors.accent} fill={Colors.accent} />{' '}
            Made in Africa
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  /* ── HERO ── */
  hero: {
    backgroundColor: '#FFF7ED',
    paddingBottom: 48,
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  heroButtons: {
    marginTop: 28,
    gap: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outlineBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  outlineBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  /* ── AFRICA NETWORK MAP ── */
  mapSection: {
    paddingVertical: 36,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  mapImage: {
    width: '100%',
    aspectRatio: 1.5,
  },
  cityLabel: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(217, 119, 6, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },

  /* ── HOW IT WORKS ── */
  howSection: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  howCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  howCardImage: {
    width: '100%',
    height: 160,
  },
  howCardBody: {
    padding: 20,
  },
  howCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  howCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  howCardDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  /* ── CTA ── */
  ctaSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  ctaButtons: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  ctaPrimaryBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
  },
  ctaPrimaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  ctaOutlineBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'transparent',
  },
  ctaOutlineBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* ── FOOTER ── */
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  footerBrandAccent: {
    color: Colors.primary,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footerCopy: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
  },
});
