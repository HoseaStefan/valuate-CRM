import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.18.20:3000';
const API_URL = `${API_BASE_URL}/api`;

// Create axios instance with timeout
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout
});

export const authService = {
  /**
   * Authenticate user with backend
   */
  async authenticate(username: string, password: string): Promise<any> {
    try {
      console.log(`[Auth] Attempting login for: ${username}`);
      console.log(`[Auth] API URL: ${API_URL}/auth/login`);
      
      const response = await apiClient.post('/auth/login', { username, password });
      
      console.log('[Auth] Login successful');
      
      if (response.data && response.data.token) {
        // Automatically store token and user data
        await this.storeAuthData(response.data);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[Auth] Login error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      let errorMessage = 'Login failed';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Is the backend server running?';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = `Cannot connect to ${API_BASE_URL}. Check your backend IP in .env`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.response?.status === 404) {
        errorMessage = 'Backend endpoint not found. Check API URL';
      } else if (error.response?.status === 500) {
        errorMessage = 'Backend server error. Check server logs';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Check backend connection and IP address';
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Store authentication data locally
   */
  async storeAuthData(data: any): Promise<void> {
    try {
      console.log('[Auth] Storing authentication data');
      if (data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
      }
      if (data.user) {
        await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
      }
      console.log('[Auth] Auth data stored successfully');
    } catch (error) {
      console.error('[Auth] Error storing auth data:', error);
      throw error;
    }
  },

  /**
   * Get stored token
   */
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('userToken');
    } catch (error) {
      console.error('[Auth] Error getting token:', error);
      return null;
    }
  },

  /**
   * Get stored user data
   */
  async getUserData(): Promise<any | null> {
    try {
      const data = await SecureStore.getItemAsync('userData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[Auth] Error getting user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },

  /**
   * Clear all authentication data on logout
   */
  async clearAuth(): Promise<void> {
    try {
      console.log('[Auth] Clearing authentication data');
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
    } catch (error) {
      console.error('[Auth] Error clearing auth:', error);
    }
  },

  /**
   * Reset password request
   */
  async resetPassword(username: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/auth/reset-password', { username });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      return { success: false, message: errorMessage };
    }
  },

  /**
   * Get current API URL (for debugging)
   */
  getApiUrl(): string {
    return API_URL;
  },
};
