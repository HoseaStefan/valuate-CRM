import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';
import { router } from 'expo-router';
import { useUserContext } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { Image as ExpoImage } from 'expo-image';

export default function ProfileScreen() {
  const [showChangePasswordModal, setShowChangePasswordModal] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
 

  // Get user data from context
  const {
    user,
    detailedUser,
    profileImageUrl,
    updateProfileImage,
  } = useUserContext();

  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.log('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleOpenChangePassword = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePasswordModal(true);
  };

  const handleChangePassword = async () => {
    if (changingPassword) return;

    // Basic validation
    if (!newPassword || newPassword.length < 4) {
      Alert.alert('Error', 'Password minimal 4 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return;
    }

    try {
      setChangingPassword(true);

      // Frontend-only mock: no backend integration yet
      await new Promise(resolve => setTimeout(resolve, 250));
      Alert.alert('Berhasil', 'Password berhasil diubah (mock)');
      setShowChangePasswordModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
      const msg = error instanceof Error ? error.message : 'Gagal mengubah password';
      Alert.alert('Error', msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 80 }}>
        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profileImageUrl ? (
                <ExpoImage
                  source={{ uri: profileImageUrl }}
                  style={styles.profileImage}
                  onError={() => {
                    console.log('Failed to load profile image');
                    updateProfileImage('');
                  }}
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <IconSymbol name="person.fill" size={32} color={ValuateColors.text.inverse} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{detailedUser?.namaLengkap || user?.namaLengkap || 'Loading...'}</Text>
              <Text style={styles.userEmail}>@{user?.username || 'username'}</Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Account Settings</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleOpenChangePassword}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: ValuateColors.success }]}>
                <IconSymbol name="lock" size={20} color={ValuateColors.text.inverse} />
              </View>
              <Text style={styles.settingText}>Ganti Password</Text>
            </View>
              <IconSymbol name="chevron.right" size={16} color={ValuateColors.text.light} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: ValuateColors.primary }]}>
                <IconSymbol name="door.left.hand.open" size={20} color={ValuateColors.text.inverse} />
              </View>
              <Text style={styles.settingText}>Logout</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={ValuateColors.text.light} />
          </TouchableOpacity>

        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.5</Text>
        </View>
      </ScrollView>
      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ganti Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Password baru"
                secureTextEntry={!showNewPassword}
                style={styles.inputWithIcon}
                editable={!changingPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
                disabled={changingPassword}
              >
                <IconSymbol
                  name={showNewPassword ? "eye.slash" : "eye"}
                  size={20}
                  color={ValuateColors.text.light}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ketik ulang password baru"
                secureTextEntry={!showConfirmPassword}
                style={styles.inputWithIcon}
                editable={!changingPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={changingPassword}
              >
                <IconSymbol
                  name={showConfirmPassword ? "eye.slash" : "eye"}
                  size={20}
                  color={ValuateColors.text.light}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowChangePasswordModal(false)}
                disabled={changingPassword}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color={ValuateColors.text.inverse} />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalPrimaryButtonText]}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ValuateColors.navBackground,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: ValuateColors.background,
    borderBottomWidth: 1,
    borderBottomColor: ValuateColors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ValuateColors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: ValuateColors.contentBackground,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...ValuateColors.shadow.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ValuateColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ValuateColors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: ValuateColors.text.secondary,
    marginBottom: 2,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ValuateColors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCard: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...ValuateColors.shadow.medium,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ValuateColors.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ValuateColors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: ValuateColors.text.primary,
    fontWeight: '500',
  },
  logoutCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: ValuateColors.error,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: ValuateColors.text.light,
  },
  userRole: {
    fontSize: 12,
    color: ValuateColors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ValuateColors.text.primary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: ValuateColors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: ValuateColors.background,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  inputWithIcon: {
    borderWidth: 1,
    borderColor: ValuateColors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingRight: 45,
    backgroundColor: ValuateColors.background,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 10,
    padding: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: ValuateColors.secondaryBackground,
  },
  modalButtonText: {
    color: ValuateColors.text.primary,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    backgroundColor: ValuateColors.primary,
  },
  modalPrimaryButtonText: {
    color: ValuateColors.text.inverse,
  },
});