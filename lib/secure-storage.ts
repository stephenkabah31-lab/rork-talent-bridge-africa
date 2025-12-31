import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
} as const;

class SecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw new Error('Failed to store data securely');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  async setAuthToken(token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async removeAuthToken(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async setUserData(userData: object): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  async getUserData<T>(): Promise<T | null> {
    const data = await this.getItem(STORAGE_KEYS.USER_DATA);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async clearAll(): Promise<void> {
    await this.removeAuthToken();
    await this.removeItem(STORAGE_KEYS.USER_DATA);
    await this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}

export const secureStorage = new SecureStorage();
export { STORAGE_KEYS };
