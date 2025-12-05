// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
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
      <Stack.Screen name="user-type" options={{ title: 'Select Account Type' }} />
      <Stack.Screen name="signup-professional" options={{ title: 'Professional Sign Up' }} />
      <Stack.Screen name="signup-recruiter" options={{ title: 'Recruiter Sign Up' }} />
      <Stack.Screen name="signup-company" options={{ title: 'Company Sign Up' }} />
      <Stack.Screen name="home" options={{ title: 'TalentBridge' }} />
      <Stack.Screen name="subscription" options={{ title: 'Premium Subscription' }} />
      <Stack.Screen name="admin-login" options={{ title: 'Admin Login' }} />
      <Stack.Screen name="jobs" options={{ title: 'Jobs' }} />
      <Stack.Screen name="messages" options={{ title: 'Messages' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
