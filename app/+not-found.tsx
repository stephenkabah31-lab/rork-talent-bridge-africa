import { Link, Stack } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Page Not Found',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
        }}
      />
      <View style={styles.container}>
        <AlertCircle color={Colors.primary} size={64} strokeWidth={2} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  link: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
