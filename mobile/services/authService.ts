import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:3000/api'; // Or your deployed backend IP

export const authService = {
  async authenticate(username: string, password: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      return response.data;
    } catch (error: any) {
      console.error('Login error', error.response?.data || error.message);
      throw error;
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('userToken', token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('userToken');
  },

  async getRememberMe(): Promise<boolean> {
    const value = await SecureStore.getItemAsync('rememberMe');
    return value === 'true';
  },

  async setRememberMe(value: boolean, username: string = ''): Promise<void> {
    await SecureStore.setItemAsync('rememberMe', String(value));
    if (value && username) {
      await SecureStore.setItemAsync('rememberUsername', username);
    } else {
      await SecureStore.deleteItemAsync('rememberUsername');
    }
  },

  async getUsername(): Promise<string | null> {
    return await SecureStore.getItemAsync('rememberUsername');
  },

  async shouldAutoLogin(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },

  async isAuthenticated(): Promise<{ isAuthenticated: boolean }> {
    const token = await this.getToken();
    return { isAuthenticated: !!token };
  },

  async forceClearAuth(): Promise<void> {
    await SecureStore.deleteItemAsync('userToken');
  },

  async resetPassword(username: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { username });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed' };
    }
  }
};
