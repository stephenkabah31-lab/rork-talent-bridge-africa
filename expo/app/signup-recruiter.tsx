import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Building2, Eye, EyeOff, Lock, Mail, Phone, Search, User } from 'lucide-react-native';
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
import { trpc } from '@/lib/trpc';
import { secureStorage } from '@/lib/secure-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  agencyName: string;
  specialization: string;
  yearsExperience: string;
  password: string;
  confirmPassword: string;
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
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signupMutation = trpc.auth.signup.useMutation();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.agencyName ||
      !formData.specialization ||
      !formData.password
    ) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      Alert.alert(
        'Password Requirements',
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'You must accept the Terms of Service to continue');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signupMutation.mutateAsync({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        userType: 'recruiter',
        fullName: formData.fullName,
        companyName: formData.agencyName,
        phoneNumber: formData.phone,
        country: '', // Could add location field if needed
        acceptedTerms: true,
      });

      if (result.success && result.user) {
        await secureStorage.setAuthToken(result.token);
        await secureStorage.setUserData(result.user);
        await AsyncStorage.setItem('user', JSON.stringify(result.user));
        router.replace('/(tabs)/home' as any);
      }
    } catch (error: any) {
      const message = error?.message || error?.shape?.message || 'Failed to create account. Please try again.';
      Alert.alert('Signup Failed', message);
      console.error('Signup error:', error);
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
          headerStyle: { backgroundColor: 'transparent' },
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
              {/* Full Name */}
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

              {/* Email */}
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

              {/* Phone */}
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

              {/* Agency Name */}
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

              {/* Specialization */}
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

              {/* Years Experience */}
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

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.inputContainer}>
                  <Lock color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor={Colors.textLight}
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    {showPassword ? (
                      <EyeOff color={Colors.textLight} size={20} />
                    ) : (
                      <Eye color={Colors.textLight} size={20} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.inputContainer}>
                  <Lock color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor={Colors.textLight}
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Terms Checkbox */}
              <Pressable
                style={styles.termsRow}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                  {acceptedTerms && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.termsText}>
                  I accept the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push('/terms');
                    }}
                  >
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push('/privacy');
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.buttonPressed,
                (isLoading || !acceptedTerms) && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={isLoading || !acceptedTerms}
            >
              <LinearGradient
                colors={[Colors.secondary, '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Creating Account...' : 'Agree & Create Account'}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.footer}>
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 100, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.secondary, alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.light, textAlign: 'center', lineHeight: 20 },
  form: { gap: 20, marginBottom: 32 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.white },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: { flex: 1, fontSize: 16, color: Colors.white },
  eyeButton: { padding: 4 },
  termsRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.secondary, borderColor: Colors.secondary,
  },
  checkmark: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  termsText: { flex: 1, fontSize: 13, color: Colors.light, lineHeight: 20 },
  termsLink: { color: Colors.secondary, fontWeight: '700', textDecorationLine: 'underline' },
  submitButton: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  gradientButton: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonDisabled: { opacity: 0.6 },
  footer: { marginTop: 24, alignItems: 'center', gap: 16 },
  signInLink: { paddingVertical: 8 },
  signInLinkText: { fontSize: 14, color: Colors.light, textAlign: 'center' },
  signInLinkBold: { fontWeight: '700', color: Colors.white },
});
