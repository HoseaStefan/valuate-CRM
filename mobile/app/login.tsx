import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';
import { router } from 'expo-router';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
// import * as Notifications from 'expo-notifications';
import { Image as ExpoImage } from 'expo-image';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [tokenExpiredVisible, setTokenExpiredVisible] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Use AuthContext instead of authService directly
  const { login: contextLogin, user } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Add small delay to ensure any pending logout operations complete
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check if user wants to be remembered for auto-fill
      const remember = await authService.getRememberMe();
      const storedUsername = await authService.getUsername();

      setRememberMe(remember);

      // Auto-fill username if remember me is enabled
      if (remember && storedUsername) {
        setUsername(storedUsername);
      }
    } catch (error) {
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      // Use AuthContext login method instead of authService directly
      const success = await contextLogin(username, password, rememberMe);

      if (!success) {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotUsername) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await authService.resetPassword(forgotUsername);

      if (response.success) {
        Alert.alert(
          'Reset Email Sent',
          response.message,
          [
            {
              text: 'OK',
              onPress: () => {
                setForgotPasswordVisible(false);
                setForgotUsername('');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleTokenExpiredAcknowledge = async () => {
    try {
      await authService.forceClearAuth();
    } catch (e) { }
    setTokenExpiredVisible(false);
    // keep username autofill if remembered; user must re-login now
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <ExpoImage
                source={require('@/assets/images/valuate.png')}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <IconSymbol name="person.circle" size={20} color={ValuateColors.text.light} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={ValuateColors.text.light}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="default"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <IconSymbol name="lock" size={20} color={ValuateColors.text.light} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={ValuateColors.text.light}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                  <IconSymbol
                    name={isPasswordVisible ? "eye.slash" : "eye"}
                    size={18}
                    color={ValuateColors.text.light}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <IconSymbol name="checkmark" size={14} color={ValuateColors.primary} />}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setForgotPasswordVisible(true)}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={forgotPasswordVisible}
        onRequestClose={() => setForgotPasswordVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lupa Password?</Text>
            </View>

            <Text style={styles.modalDescription}>
              Kontak admin untuk mereset password Anda.
            </Text>


            <TouchableOpacity
              style={[styles.modalButton, forgotLoading && styles.modalButtonDisabled]}
              onPress={() => setForgotPasswordVisible(false)}
            >
              <Text style={styles.modalButtonText}>
                Tutup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Token expired modal (shown when stored token is invalid but rememberMe was set) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={tokenExpiredVisible}
        onRequestClose={() => setTokenExpiredVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Token Expired</Text>
            </View>

            <Text style={styles.modalDescription}>
              Session Anda telah kadaluarsa. Silakan login kembali untuk melanjutkan.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleTokenExpiredAcknowledge}
            >
              <Text style={styles.modalButtonText}>Login Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ValuateColors.contentBackground,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 200,
    height: 200,
    borderRadius: 35,
    marginBottom: 50,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '600',
    color: ValuateColors.text.secondary,
    letterSpacing: 2,
    marginTop: -12,
  },
  logoSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: ValuateColors.text.light,
    letterSpacing: 4,
    marginTop: -4,
  },
  tagline: {
    fontSize: 16,
    color: ValuateColors.text.light,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ValuateColors.text.light + '40',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: ValuateColors.text.primary,
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: ValuateColors.text.light + '60',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: 'white',
    borderColor: ValuateColors.primary,
  },
  rememberMeText: {
    fontSize: 14,
    color: ValuateColors.text.secondary,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: ValuateColors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: ValuateColors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: ValuateColors.text.light,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoSection: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ValuateColors.text.primary,
    marginBottom: 8,
  },
  notificationIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: ValuateColors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  notificationFeatures: {
    marginVertical: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: ValuateColors.text.secondary,
    marginLeft: 12,
    flex: 1,
  },
  skipButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: ValuateColors.text.light,
    fontWeight: '600',
  },
  demoText: {
    fontSize: 12,
    color: ValuateColors.text.secondary,
    marginVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: ValuateColors.cardBackground,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ValuateColors.text.primary,
  },
  modalDescription: {
    fontSize: 16,
    color: ValuateColors.text.secondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: ValuateColors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalButtonDisabled: {
    backgroundColor: ValuateColors.text.light,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});