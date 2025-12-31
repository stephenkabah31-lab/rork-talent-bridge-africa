import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Building2, Eye, EyeOff, Lock, Mail, Search, User } from 'lucide-react-native';
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

type UserType = 'professional' | 'recruiter' | 'company';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>('professional');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter email and password');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      console.log('Logging in as:', userType);
      const user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        type: userType,
        fullName: userType === 'professional' ? 'Professional User' : undefined,
        companyName: userType === 'company' ? 'Company Name' : undefined,
        agencyName: userType === 'recruiter' ? 'Agency Name' : undefined,
        profession: userType === 'professional' ? 'Professional' : undefined,
        industry: userType === 'company' ? 'Company' : (userType === 'recruiter' ? 'Recruiter' : undefined),
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      console.log('User saved:', JSON.stringify(user, null, 2));
      setIsLoading(false);
      router.replace('/(tabs)/home' as any);
    }, 1000);
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
          colors={[Colors.dark, Colors.darkLight, Colors.primary]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to TalentBridge</Text>
            </View>

            <View style={styles.userTypeSelector}>
              <Pressable
                style={({ pressed }) => [
                  styles.typeButton,
                  userType === 'professional' && styles.typeButtonActive,
                  pressed && styles.typeButtonPressed,
                ]}
                onPress={() => setUserType('professional')}
              >
                <User
                  color={userType === 'professional' ? Colors.primary : Colors.textLight}
                  size={20}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    userType === 'professional' && styles.typeButtonTextActive,
                  ]}
                >
                  Professional
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.typeButton,
                  userType === 'recruiter' && styles.typeButtonActive,
                  pressed && styles.typeButtonPressed,
                ]}
                onPress={() => setUserType('recruiter')}
              >
                <Search
                  color={userType === 'recruiter' ? Colors.secondary : Colors.textLight}
                  size={20}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    userType === 'recruiter' && styles.typeButtonTextActive,
                  ]}
                >
                  Recruiter
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.typeButton,
                  userType === 'company' && styles.typeButtonActive,
                  pressed && styles.typeButtonPressed,
                ]}
                onPress={() => setUserType('company')}
              >
                <Building2
                  color={userType === 'company' ? Colors.accent : Colors.textLight}
                  size={20}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    userType === 'company' && styles.typeButtonTextActive,
                  ]}
                >
                  Company
                </Text>
              </Pressable>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Mail color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.textLight}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock color={Colors.textLight} size={20} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff color={Colors.textLight} size={20} />
                    ) : (
                      <Eye color={Colors.textLight} size={20} />
                    )}
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.buttonPressed,
                  (isLoading || !email || !password) && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading || !email || !password}
              >
                <LinearGradient
                  colors={[Colors.primary, '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.push('/user-type')}
              >
                <Text style={styles.secondaryButtonText}>Create New Account</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.adminLink}
              onPress={() => router.push('/admin-login')}
            >
              <Lock color={Colors.textLight} size={14} />
              <Text style={styles.adminLinkText}>Admin Access</Text>
            </Pressable>
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
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light,
    textAlign: 'center',
  },
  form: {
    gap: 24,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 17,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: 13,
    color: Colors.light,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginTop: 16,
  },
  adminLinkText: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
  },
  userTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  typeButtonPressed: {
    opacity: 0.8,
  },
  typeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
  },
  typeButtonTextActive: {
    color: Colors.dark,
  },
});
