import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:3000/api'; // Or your deployed backend IP

export const authService = {
  async authenticate(username, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      return response.data;
    } catch (error) {
      console.error('Login error', error.response?.data || error.message);
      throw error;
    }
  },

  async setToken(token) {
    await SecureStore.setItemAsync('userToken', token);
  },

  async getToken() {
    return await SecureStore.getItemAsync('userToken');
  },

  async getRememberMe() {
    const value = await SecureStore.getItemAsync('rememberMe');
    return value === 'true';
  },

  async setRememberMe(value, username = '') {
    await SecureStore.setItemAsync('rememberMe', String(value));
    if (value && username) {
      await SecureStore.setItemAsync('rememberUsername', username);
    } else {
      await SecureStore.deleteItemAsync('rememberUsername');
    }
  },

  async getUsername() {
    return await SecureStore.getItemAsync('rememberUsername');
  },

  async shouldAutoLogin() {
    const token = await this.getToken();
    return !!token;
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return { isAuthenticated: !!token };
  },

  async forceClearAuth() {
    await SecureStore.deleteItemAsync('userToken');
  },

  async resetPassword(username) {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { username });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed' };
    }
  }
};
