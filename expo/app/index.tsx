import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Briefcase,
  Building2,
  Heart,
  MessageCircle,
  Shield,
  Target,
  Users,
} from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
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

const { width } = Dimensions.get('window');
const PROJECT_ID = 'ln0w2dnjwy17g62tuteow';
const rorkAsset = (key: string) =>
  `https://rork.app/pa/${PROJECT_ID}/${key}`;

export default function IndexRedirect() {
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);

  const checkUserStatus = React.useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        router.replace('/(tabs)/home' as any);
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
      <View style={styles.splashContainer}>
        <View style={StyleSheet.absoluteFill} />
      </View>
    );
  }

  return <WelcomeScreen />;
}

function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const howItWorksCards = [
    {
      icon: Target,
      title: t('landing.forProfessionals'),
      desc: t('landing.forProfessionalsDesc'),
      color: Colors.primary,
      image: 'a_young_african',
      route: '/signup-professional',
    },
    {
      icon: Users,
      title: t('landing.forRecruiters'),
      desc: t('landing.forRecruitersDesc'),
      color: Colors.secondary,
      image: 'female_recruiter_at_desk',
      route: '/signup-recruiter',
    },
    {
      icon: Building2,
      title: t('landing.forCompanies'),
      desc: t('landing.forCompaniesDesc'),
      color: '#7C3AED',
      image: 'glass_tower_african_city',
      route: '/signup-company',
    },
  ];

  const features = [
    {
      icon: Briefcase,
      title: 'Live job listings',
      desc: 'Browse hundreds of roles across Africa\'s top companies.',
      color: Colors.primary,
    },
    {
      icon: MessageCircle,
      title: 'Direct messaging',
      desc: 'Chat with recruiters and peers — no middlemen, no delays.',
      color: Colors.secondary,
    },
    {
      icon: Users,
      title: 'Professional network',
      desc: 'Build connections that open doors to new opportunities.',
      color: '#7C3AED',
    },
    {
      icon: Target,
      title: 'Smart matching',
      desc: 'Our algorithm surfaces roles that fit your skills and goals.',
      color: Colors.accent,
    },
    {
      icon: MessageCircle,
      title: 'Video interviews',
      desc: 'Schedule and conduct calls right on the platform.',
      color: '#0891B2',
    },
    {
      icon: Shield,
      title: 'Verified employers',
      desc: 'Every company goes through a verification process.',
      color: Colors.secondary,
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO ── */}
        <View style={styles.hero}>
          <View style={styles.heroBg}>
            <Image
              source={{ uri: rorkAsset('african_professionals_office') }}
              style={styles.heroBgImage}
              resizeMode="cover"
            />
          </View>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Africa's professional{'\n'}network for{' '}
                <Text style={styles.heroHighlight}>finding work</Text>
                {' '}and{' '}
                <Text style={styles.heroHighlight}>hiring talent</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Connect with professionals, browse live job listings, message
                recruiters directly, and land your next role — all in one place.
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
                      {t('landing.joinNow')}
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
                  <Text style={styles.outlineBtnText}>Browse Jobs</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* ── AFRICA NETWORK MAP ── */}
        <View style={styles.mapSection}>
          <View style={styles.mapContainer}>
            <Image
              source={{ uri: rorkAsset('africa_network_map') }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <Text style={[styles.cityLabel, { top: '8%', left: '48%' }]}>
              Cairo
            </Text>
            <Text style={[styles.cityLabel, { top: '28%', left: '12%' }]}>
              Dakar
            </Text>
            <Text style={[styles.cityLabel, { top: '38%', left: '35%' }]}>
              Lagos
            </Text>
            <Text style={[styles.cityLabel, { top: '33%', left: '62%' }]}>
              Nairobi
            </Text>
            <Text style={[styles.cityLabel, { top: '42%', left: '52%' }]}>
              Kinshasa
            </Text>
            <Text style={[styles.cityLabel, { top: '68%', left: '48%' }]}>
              Johannesburg
            </Text>
            <Text style={[styles.cityLabel, { top: '73%', left: '40%' }]}>
              Cape Town
            </Text>
            <Text style={[styles.cityLabel, { top: '18%', left: '65%' }]}>
              Addis Ababa
            </Text>
            <Text style={[styles.cityLabel, { top: '15%', left: '28%' }]}>
              Casablanca
            </Text>
            <Text style={[styles.cityLabel, { top: '45%', left: '22%' }]}>
              Accra
            </Text>
            <Text style={[styles.cityLabel, { top: '48%', left: '68%' }]}>
              Dar es Salaam
            </Text>
          </View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <View style={styles.howSection}>
          <Text style={styles.sectionTitle}>{t('landing.howItWorks')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('landing.heroSubtitle')}
          </Text>

          {howItWorksCards.map((card) => (
            <Pressable
              key={card.title}
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
                <Text style={styles.howCardTitle}>{card.title}</Text>
                <Text style={styles.howCardDesc}>{card.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── FEATURES ── */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Everything in one place</Text>

          <View style={styles.featuresGrid}>
            {features.map((item) => (
              <View key={item.title} style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${item.color}18` },
                  ]}
                >
                  <item.icon color={item.color} size={20} />
                </View>
                <View style={styles.featureTextWrap}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── CTA ── */}
        <LinearGradient
          colors={[Colors.primary, '#9A3412']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaTitle}>Ready to take the next step?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of professionals already using TalentBridge to find
            opportunities and grow their careers across Africa.
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
    position: 'relative',
    backgroundColor: '#FFF7ED',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  heroBgImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
    paddingHorizontal: 8,
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

  /* ── AFRICA MAP ── */
  mapSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  mapImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  cityLabel: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(217, 119, 6, 0.85)',
    paddingHorizontal: 6,
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 16,
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

  /* ── FEATURES ── */
  featuresSection: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  featuresGrid: {
    marginTop: 28,
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
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
