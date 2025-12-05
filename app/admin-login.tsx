import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Shield, User } from 'lucide-react-native';
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

type AuthStep = 'credentials' | 'verification';

export default function AdminLoginScreen() {
  const router = useRouter();
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing Information', 'Please enter username and password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setAuthStep('verification');
      console.log('Verification code sent to admin');
    }, 1500);
  };

  const handleVerification = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Login Successful',
        'Welcome to the admin dashboard',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/home'),
          },
        ]
      );
    }, 1500);
  };

  const handleCodeInput = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.charAt(0);
    }

    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text && index < 5) {
      const nextInput = index + 1;
      console.log(`Moving to input ${nextInput}`);
    }
  };

  const handleResendCode = () => {
    Alert.alert('Code Resent', 'A new verification code has been sent');
    setVerificationCode(['', '', '', '', '', '']);
    console.log('New verification code sent');
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
          colors={[Colors.dark, Colors.darkLight, '#1E3A8A']}
          locations={[0, 0.5, 1]}
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
              <View style={styles.iconCircle}>
                <Shield color={Colors.white} size={36} strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Admin Access</Text>
              <Text style={styles.subtitle}>
                {authStep === 'credentials'
                  ? 'Secure login for administrators'
                  : 'Enter verification code'}
              </Text>
            </View>

            {authStep === 'credentials' ? (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.inputContainer}>
                    <User color={Colors.textLight} size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter username"
                      placeholderTextColor={Colors.textLight}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
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
                      placeholder="Enter password"
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
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#1E40AF', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.submitButtonText}>
                      {isLoading ? 'Authenticating...' : 'Continue'}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <View style={styles.securityBadge}>
                  <Shield color={Colors.success} size={16} />
                  <Text style={styles.securityText}>
                    Two-factor authentication enabled
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.verificationContainer}>
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationText}>
                    We&apos;ve sent a 6-digit code to your registered device
                  </Text>
                </View>

                <View style={styles.codeInputContainer}>
                  {verificationCode.map((digit, index) => (
                    <View key={index} style={styles.codeBox}>
                      <TextInput
                        style={styles.codeInput}
                        value={digit}
                        onChangeText={(text) => handleCodeInput(text, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                      />
                    </View>
                  ))}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.buttonPressed,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleVerification}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#1E40AF', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.submitButtonText}>
                      {isLoading ? 'Verifying...' : 'Verify & Login'}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
                  <Pressable onPress={handleResendCode}>
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={styles.backButton}
                  onPress={() => setAuthStep('credentials')}
                >
                  <Text style={styles.backButtonText}>← Back to Login</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.footer}>
              <Lock color={Colors.textLight} size={14} />
              <Text style={styles.footerText}>
                All connections are encrypted and secure
              </Text>
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
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    lineHeight: 22,
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
    shadowColor: '#3B82F6',
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  securityText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
  },
  verificationContainer: {
    gap: 24,
  },
  verificationInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  verificationText: {
    fontSize: 14,
    color: Colors.light,
    textAlign: 'center',
    lineHeight: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  codeBox: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  codeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    color: Colors.light,
  },
  resendLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: Colors.light,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
