import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Building2, Mail, Phone, Search, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  agencyName: string;
  specialization: string;
  yearsExperience: string;
}

export default function SignupRecruiterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    agencyName: '',
    specialization: '',
    yearsExperience: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.agencyName ||
      !formData.specialization
    ) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        ...formData,
        userType: 'recruiter',
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));

      Alert.alert(
        'Welcome to TalentBridge!',
        'Your recruiter account has been created successfully.',
        [
          {
            text: 'Get Started',
            onPress: () => {
              setIsLoading(false);
              router.replace('/home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: Colors.white,
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
              <View style={styles.iconCircle}>
                <Search color={Colors.white} size={28} />
              </View>
              <Text style={styles.title}>Recruiter Account</Text>
              <Text style={styles.subtitle}>
                Connect top talent with amazing opportunities
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <User color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Jane Smith"
                    placeholderTextColor={Colors.textLight}
                    value={formData.fullName}
                    onChangeText={(text) => handleInputChange('fullName', text)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={styles.inputContainer}>
                  <Mail color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="jane@recruitingagency.com"
                    placeholderTextColor={Colors.textLight}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={styles.inputContainer}>
                  <Phone color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="+233 24 123 4567"
                    placeholderTextColor={Colors.textLight}
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Agency / Company Name *</Text>
                <View style={styles.inputContainer}>
                  <Building2 color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Talent Solutions Ghana"
                    placeholderTextColor={Colors.textLight}
                    value={formData.agencyName}
                    onChangeText={(text) => handleInputChange('agencyName', text)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Industry Specialization *</Text>
                <View style={styles.inputContainer}>
                  <Search color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Technology, Finance, Healthcare"
                    placeholderTextColor={Colors.textLight}
                    value={formData.specialization}
                    onChangeText={(text) => handleInputChange('specialization', text)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Years in Recruiting</Text>
                <View style={styles.inputContainer}>
                  <User color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="3"
                    placeholderTextColor={Colors.textLight}
                    value={formData.yearsExperience}
                    onChangeText={(text) => handleInputChange('yearsExperience', text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.secondary, '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By signing up, you agree to our Terms of Service and Privacy Policy
              </Text>
              <Pressable
                style={styles.signInLink}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.signInLinkText}>
                  Already have an account? <Text style={styles.signInLinkBold}>Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.secondary,
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
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light,
    textAlign: 'center',
    lineHeight: 18,
  },
  signInLink: {
    paddingVertical: 8,
  },
  signInLinkText: {
    fontSize: 14,
    color: Colors.light,
    textAlign: 'center',
  },
  signInLinkBold: {
    fontWeight: '700',
    color: Colors.white,
  },
});
