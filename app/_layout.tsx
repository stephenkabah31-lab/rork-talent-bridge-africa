import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#1E3A8A',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '700',
      },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="user-type" options={{ title: 'Select Account Type' }} />
      <Stack.Screen name="signup-professional" options={{ title: 'Professional Sign Up' }} />
      <Stack.Screen name="signup-recruiter" options={{ title: 'Recruiter Sign Up' }} />
      <Stack.Screen name="signup-company" options={{ title: 'Company Sign Up' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ title: 'Premium Subscription' }} />
      <Stack.Screen name="admin-login" options={{ title: 'Admin Login' }} />
      <Stack.Screen name="admin-verify" options={{ title: 'Admin Verification' }} />
      <Stack.Screen name="apply-job" options={{ title: 'Apply for Job' }} />
      <Stack.Screen name="post-job" options={{ title: 'Post a Job' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages' }} />
      <Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="create-post" options={{ title: 'Create Post' }} />
      <Stack.Screen name="user-profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="connections" options={{ title: 'My Connections' }} />
      <Stack.Screen name="people-search" options={{ title: 'Find People' }} />
      <Stack.Screen name="jobs" options={{ title: 'Jobs' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="schedule-call" options={{ title: 'Schedule Call' }} />
      <Stack.Screen name="scheduled-calls" options={{ title: 'Scheduled Calls' }} />
      <Stack.Screen name="waiting-room" options={{ headerShown: false }} />
      <Stack.Screen name="active-call" options={{ headerShown: false }} />
      <Stack.Screen name="admit-candidates" options={{ headerShown: false }} />
      <Stack.Screen name="manage-applications" options={{ title: 'Manage Applications' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="admin-dashboard" options={{ title: 'Admin Dashboard' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
