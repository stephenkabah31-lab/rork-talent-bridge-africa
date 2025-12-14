import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ImageIcon, X } from 'lucide-react-native';
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

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    },
  });

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something to post');
      return;
    }

    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      Alert.alert('Success', 'Post published!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0) || user?.companyName?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.fullName || user?.companyName || 'User'}
              </Text>
              <Text style={styles.postingAs}>Posting publicly</Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="What do you want to talk about?"
            placeholderTextColor={Colors.textLight}
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} contentFit="cover" />
              <Pressable
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <X color={Colors.white} size={20} />
              </Pressable>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={handleSelectImage}>
              <ImageIcon color={Colors.primary} size={24} />
              <Text style={styles.actionButtonText}>Add photo</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.postButton,
              !content.trim() && styles.postButtonDisabled,
              pressed && styles.postButtonPressed,
            ]}
            onPress={handlePost}
            disabled={!content.trim() || isPosting}
          >
            <Text
              style={[
                styles.postButtonText,
                !content.trim() && styles.postButtonTextDisabled,
              ]}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  postingAs: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  postButton: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: Colors.light,
  },
  postButtonPressed: {
    opacity: 0.7,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  postButtonTextDisabled: {
    color: Colors.textLight,
  },
});
