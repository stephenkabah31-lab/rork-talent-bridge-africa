import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import { Building2, CheckCircle, Eye, EyeOff, Globe, Lock, Mail, MapPin, Phone, Upload, User, Users } from 'lucide-react-native';
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
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  companySize: string;
  website: string;
  registrationNumber: string;
  password: string;
  confirmPassword: string;
  verificationDocUri?: string;
  verificationDocName?: string;
}

export default function SignupCompanyScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    industry: '',
    companySize: '',
    website: '',
    registrationNumber: '',
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

  const handleUploadVerificationDoc = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFormData((prev) => ({
          ...prev,
          verificationDocUri: file.uri,
          verificationDocName: file.name,
        }));
        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const handleSignup = async () => {
    if (
      !formData.companyName ||
      !formData.contactPerson ||
      !formData.email ||
      !formData.phone ||
      !formData.location ||
      !formData.industry ||
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
        userType: 'company',
        fullName: formData.contactPerson,
        companyName: formData.companyName,
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
                <Building2 color={Colors.white} size={28} />
              </View>
              <Text style={styles.title}>Company Account</Text>
              <Text style={styles.subtitle}>
                Find and hire the best talent for your organization
              </Text>
            </View>

            <View style={styles.form}>
              {/* Company Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company Name *</Text>
                <View style={styles.inputContainer}>
                  <Building2 color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Acme Technologies Ltd."
                    placeholderTextColor={Colors.textLight}
                    value={formData.companyName}
                    onChangeText={(text) => handleInputChange('companyName', text)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Contact Person */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Person *</Text>
                <View style={styles.inputContainer}>
                  <User color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Mensah"
                    placeholderTextColor={Colors.textLight}
                    value={formData.contactPerson}
                    onChangeText={(text) => handleInputChange('contactPerson', text)}
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
                    placeholder="hr@acmetech.com"
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

              {/* Industry */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Industry *</Text>
                <View style={styles.inputContainer}>
                  <Building2 color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Technology, Finance, Healthcare"
                    placeholderTextColor={Colors.textLight}
                    value={formData.industry}
                    onChangeText={(text) => handleInputChange('industry', text)}
                  />
                </View>
              </View>

              {/* Company Size */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company Size</Text>
                <View style={styles.inputContainer}>
                  <Users color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="1-10, 11-50, 51-200, 200+"
                    placeholderTextColor={Colors.textLight}
                    value={formData.companySize}
                    onChangeText={(text) => handleInputChange('companySize', text)}
                  />
                </View>
              </View>

              {/* Website */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Website (Optional)</Text>
                <View style={styles.inputContainer}>
                  <Globe color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="www.acmetech.com"
                    placeholderTextColor={Colors.textLight}
                    value={formData.website}
                    onChangeText={(text) => handleInputChange('website', text)}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Registration Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Registration Number *</Text>
                <View style={styles.inputContainer}>
                  <Building2 color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="BN12345678"
                    placeholderTextColor={Colors.textLight}
                    value={formData.registrationNumber}
                    onChangeText={(text) => handleInputChange('registrationNumber', text)}
                    autoCapitalize="characters"
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

              {/* Verification Docs */}
              <View style={styles.verificationSection}>
                <View style={styles.verificationHeader}>
                  <CheckCircle color={Colors.accent} size={24} />
                  <View style={styles.verificationHeaderText}>
                    <Text style={styles.verificationTitle}>Verification Documents (Optional)</Text>
                    <Text style={styles.verificationSubtitle}>
                      Upload business registration or incorporation documents
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && styles.uploadButtonPressed,
                  ]}
                  onPress={handleUploadVerificationDoc}
                >
                  <Upload color={Colors.white} size={20} />
                  <Text style={styles.uploadButtonText}>
                    {formData.verificationDocName || 'Upload Verification Documents'}
                  </Text>
                </Pressable>

                <Text style={styles.verificationNote}>
                  Accepted formats: PDF, JPG, PNG. Max 10MB
                </Text>
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
                colors={[Colors.accent, '#F97316']}
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
    backgroundColor: Colors.accent, alignItems: 'center',
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
    backgroundColor: Colors.accent, borderColor: Colors.accent,
  },
  checkmark: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  termsText: { flex: 1, fontSize: 13, color: Colors.light, lineHeight: 20 },
  termsLink: { color: Colors.accent, fontWeight: '700', textDecorationLine: 'underline' },
  submitButton: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 },
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
  verificationSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16, padding: 20, marginBottom: 4,
    borderWidth: 2, borderColor: Colors.accent,
  },
  verificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  verificationHeaderText: { flex: 1 },
  verificationTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  verificationSubtitle: { fontSize: 13, color: Colors.light, lineHeight: 18 },
  uploadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.accent, borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 20,
  },
  uploadButtonPressed: { opacity: 0.8 },
  uploadButtonText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  verificationNote: { fontSize: 12, color: Colors.light, textAlign: 'center', marginTop: 12 },
});
