import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Briefcase, CheckCircle, Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from 'lucide-react-native';
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
  location: string;
  profession: string;
  yearsExperience: string;
  password: string;
  confirmPassword: string;
}

export default function SignupProfessionalScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    profession: '',
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
      !formData.location ||
      !formData.profession ||
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
        userType: 'professional',
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        country: formData.location,
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
                <User color={Colors.white} size={28} />
              </View>
              <Text style={styles.title}>Professional Account</Text>
              <Text style={styles.subtitle}>
                Create your profile and start connecting with opportunities
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
                    placeholder="John Doe"
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
                    placeholder="john@example.com"
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

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location *</Text>
                <View style={styles.inputContainer}>
                  <MapPin color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Accra, Ghana"
                    placeholderTextColor={Colors.textLight}
                    value={formData.location}
                    onChangeText={(text) => handleInputChange('location', text)}
                  />
                </View>
              </View>

              {/* Profession */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Profession / Job Title *</Text>
                <View style={styles.inputContainer}>
                  <Briefcase color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Software Developer"
                    placeholderTextColor={Colors.textLight}
                    value={formData.profession}
                    onChangeText={(text) => handleInputChange('profession', text)}
                  />
                </View>
              </View>

              {/* Years of Experience */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Years of Experience</Text>
                <View style={styles.inputContainer}>
                  <CheckCircle color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="5"
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
                  {acceptedTerms && <CheckCircle color={Colors.white} size={16} strokeWidth={3} />}
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
                colors={[Colors.primary, '#F59E0B']}
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
    backgroundColor: Colors.primary, alignItems: 'center',
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
    backgroundColor: Colors.primary, borderColor: Colors.primary,
  },
  termsText: { flex: 1, fontSize: 13, color: Colors.light, lineHeight: 20 },
  termsLink: { color: Colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
  submitButton: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
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
