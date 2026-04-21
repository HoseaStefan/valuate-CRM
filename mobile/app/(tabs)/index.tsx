import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useUserContext } from '@/contexts/UserContext';
import { Image as ExpoImage } from 'expo-image';
import { FlashList } from '@shopify/flash-list';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  // Get auth & user state
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { user, detailedUser, profileImageUrl, loading, refreshUserData, updateProfileImage } = useUserContext();

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading]);

  // Prevent back button from going to login
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Keluar Aplikasi',
          'Apakah Anda yakin ingin keluar?',
          [
            { text: 'Batal', style: 'cancel', onPress: () => {} },
            { text: 'Ya', onPress: () => BackHandler.exitApp() }
          ],
          { cancelable: false }
        );
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [])
  );

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshUserData(true);
      // Nanti tambahkan fetch API untuk Attendance/Leave/Reimburse disini
    } catch (error) {
      console.log('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Dummy data untuk Aktivitas Terbaru (Frontend Design Only)
  const dummyActivities = [
    { id: '1', title: 'Absen Masuk', subtitle: 'Hari ini, 08:00 AM', status: 'Tepat Waktu', type: 'attendance', color: ValuateColors.success },
    { id: '2', title: 'Pengajuan Cuti', subtitle: '12 Mei - 14 Mei 2026', status: 'Menunggu', type: 'leave', color: ValuateColors.warning },
    { id: '3', title: 'Reimburse Transport', subtitle: 'Kunjungan Proyek', status: 'Disetujui', type: 'reimburse', color: ValuateColors.primary },
  ];

  const dashboardData = [
    { id: 'header', type: 'HEADER' },
    { id: 'activities_card', type: 'ACTIVITIES_CARD', data: dummyActivities },
  ];

  const getMenuIcon = (type: string) => {
    switch (type) {
      case 'attendance': return 'clock.fill';
      case 'leave': return 'calendar';
      case 'reimburse': return 'doc.text.fill';
      default: return 'doc';
    }
  };

  const renderMasterItem = ({ item }: { item: any }) => {
    if (item.type === 'HEADER') {
      return (
        <View>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {profileImageUrl ? (
                  <ExpoImage source={profileImageUrl} style={styles.profileImage} contentFit="cover" cachePolicy="memory-disk" onError={() => updateProfileImage('')} />
                ) : (
                  <IconSymbol name="person.fill" size={24} color="white" />
                )}
              </View>
              <View>
                <Text style={styles.greeting}>Halo {detailedUser?.namaLengkap || user?.namaLengkap || 'Staff'}!</Text>
                <Text style={styles.welcomeText}>Selamat datang kembali</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>KANZEN CONSTRUCTION</Text>
            <Text style={styles.companyStatus}>Portal Staff</Text>
            
            {/* New 3 Main Menus for Staff */}
            <View style={styles.balanceActions}>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/attendance' as any)}>
                  <View style={styles.iconContainer}>
                    <IconSymbol name="clock.fill" size={24} color={ValuateColors.primary} />
                  </View>
                  <Text style={styles.actionText}>Absensi</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/reimburse' as any)}>
                  <View style={styles.iconContainer}>
                    <IconSymbol name="banknote.fill" size={24} color={ValuateColors.primary} />
                  </View>
                  <Text style={styles.actionText}>Reimburse</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/leave' as any)}>
                  <View style={styles.iconContainer}>
                    <IconSymbol name="calendar.badge.minus" size={24} color={ValuateColors.primary} />
                  </View>
                  <Text style={styles.actionText}>Cuti</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (item.type === 'ACTIVITIES_CARD') {
      return (
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          {item.data.length > 0 ? (
            item.data.map((activity: any) => (
              <TouchableOpacity key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <IconSymbol name={getMenuIcon(activity.type)} size={24} color={activity.color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={[styles.activityStatus, { color: activity.color }]}>{activity.status}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text.magnifyingglass" size={48} color={ValuateColors.text.light} />
              <Text style={styles.emptyStateText}>Belum ada aktivitas terbaru</Text>
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlashList
        data={dashboardData}
        renderItem={renderMasterItem}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ValuateColors.navBackground,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ValuateColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: ValuateColors.text.primary,
  },
  welcomeText: {
    fontSize: 14,
    color: ValuateColors.text.secondary,
  },
  balanceCard: {
    backgroundColor: ValuateColors.cardBackground,
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ValuateColors.text.secondary,
    marginBottom: 4,
  },
  companyStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: ValuateColors.primary,
    marginBottom: 10, // Adjusted for the menu spacing
  },
  balanceActions: {
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: ValuateColors.text.secondary,
    textAlign: 'center',
  },
  transactionsSection: {
    backgroundColor: ValuateColors.cardBackground,
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ValuateColors.text.primary,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ValuateColors.text.light + '20',
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ValuateColors.text.primary,
  },
  activitySubtitle: {
    fontSize: 13,
    color: ValuateColors.text.secondary,
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: ValuateColors.text.light,
    marginTop: 12,
    textAlign: 'center',
  },
});