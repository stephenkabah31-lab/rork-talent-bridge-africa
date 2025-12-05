import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Building2, Search, User } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

type UserType = 'professional' | 'recruiter' | 'company';

interface UserTypeOption {
  type: UserType;
  title: string;
  description: string;
  icon: typeof User;
  route: string;
  gradient: string[];
}

const userTypes: UserTypeOption[] = [
  {
    type: 'professional',
    title: 'Professional',
    description: 'Looking for opportunities to grow your career',
    icon: User,
    route: '/signup-professional',
    gradient: [Colors.primary, '#F59E0B'],
  },
  {
    type: 'recruiter',
    title: 'Recruiter',
    description: 'Find the best talent for your clients',
    icon: Search,
    route: '/signup-recruiter',
    gradient: [Colors.secondary, '#10B981'],
  },
  {
    type: 'company',
    title: 'Company',
    description: 'Hire talented professionals for your team',
    icon: Building2,
    route: '/signup-company',
    gradient: [Colors.accent, '#F97316'],
  },
];

export default function UserTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<UserType | null>(null);
  const scaleAnims = useRef(
    userTypes.map(() => new Animated.Value(1))
  ).current;

  const handlePress = (index: number, route: string, type: UserType) => {
    setSelected(type);
    
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        router.push(route as any);
      }, 200);
    });
  };

  return (
    <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark, Colors.darkLight]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Join TalentBridge</Text>
              <Text style={styles.subtitle}>
                Select your account type to get started
              </Text>
            </View>

            <View style={styles.cardsContainer}>
              {userTypes.map((userType, index) => {
                const Icon = userType.icon;
                const isSelected = selected === userType.type;

                return (
                  <Animated.View
                    key={userType.type}
                    style={[
                      styles.cardWrapper,
                      {
                        transform: [{ scale: scaleAnims[index] }],
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => handlePress(index, userType.route, userType.type)}
                      style={({ pressed }) => [
                        styles.card,
                        pressed && styles.cardPressed,
                        isSelected && styles.cardSelected,
                      ]}
                    >
                      <LinearGradient
                        colors={
                          isSelected
                            ? ([userType.gradient[0], userType.gradient[1]] as [string, string])
                            : (['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)'] as [string, string])
                        }
                        style={styles.cardGradient}
                      >
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: isSelected ? Colors.white : Colors.primary },
                          ]}
                        >
                          <Icon
                            color={isSelected ? userType.gradient[0] : Colors.white}
                            size={32}
                            strokeWidth={2}
                          />
                        </View>

                        <View style={styles.cardContent}>
                          <Text style={styles.cardTitle}>{userType.title}</Text>
                          <Text style={styles.cardDescription}>
                            {userType.description}
                          </Text>
                        </View>

                        <View style={styles.arrow}>
                          <Text style={styles.arrowText}>→</Text>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => console.log('Sign In')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  cardGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 120,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light,
    lineHeight: 20,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
