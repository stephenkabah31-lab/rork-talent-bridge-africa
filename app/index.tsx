import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Globe, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

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
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark, Colors.darkLight, Colors.primary]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    );
  }

  return <WelcomeScreen />;
}

function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark, Colors.darkLight, Colors.primary]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.patternContainer}>
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.patternBox,
              {
                left: (i % 4) * (width / 4) + (Math.floor(i / 4) % 2) * (width / 8),
                top: Math.floor(i / 4) * (height / 6),
                opacity: 0.03 + (i % 3) * 0.02,
              },
            ]}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
            <Text style={styles.logo}>TalentBridge</Text>
            <Text style={styles.tagline}>Africa&apos;s Professional Network</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Globe color={Colors.primary} size={28} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Pan-African Network</Text>
                <Text style={styles.featureDescription}>
                  Connecting professionals across Africa
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <TrendingUp color={Colors.secondary} size={28} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Career Growth</Text>
                <Text style={styles.featureDescription}>
                  Unlock opportunities and advance your career
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/user-type')}
            >
              <LinearGradient
                colors={[Colors.primary, '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </Pressable>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footer}>
              Empowering African professionals
            </Text>
            <Text style={styles.footerLegal}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternBox: {
    position: 'absolute',
    width: width / 6,
    height: height / 12,
    borderWidth: 2,
    borderColor: Colors.white,
    transform: [{ rotate: '45deg' }],
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: Colors.light,
    fontWeight: '500',
    letterSpacing: 1,
  },
  featuresContainer: {
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  footerContainer: {
    gap: 12,
    alignItems: 'center',
  },
  footer: {
    fontSize: 14,
    color: Colors.light,
    textAlign: 'center',
    fontWeight: '500',
  },
  footerLegal: {
    fontSize: 11,
    color: Colors.light,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
});
