import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';
import { withProtectedRoute } from '@/components/ProtectedRoute';
import { leaveService, LeaveItem, LeaveStatus } from '@/services/leaveService';

function statusColor(status: LeaveStatus) {
  switch (status) {
    case 'Disetujui':
      return ValuateColors.success;
    case 'Menunggu':
      return ValuateColors.warning;
    case 'Ditolak':
      return ValuateColors.error;
  }
}

function formatRange(start: Date, end: Date) {
  const startLabel = start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const endLabel = end.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}

function LeaveScreen() {
  const [data, setData] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const items = await leaveService.getHistory();
      const sorted = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setData(sorted);
    } catch (error) {
      console.log('[Leave] Error fetching history:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cuti</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/leave-calendar' as any)}>
          <IconSymbol name="calendar" size={20} color={ValuateColors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/leave-form' as any)}>
          <IconSymbol name="plus" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Ajukan Cuti</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Riwayat Pengajuan</Text>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={ValuateColors.primary} />
            </View>
          ) : data.length > 0 ? (
            data.map(item => {
              const color = statusColor(item.status);
              const range = formatRange(item.startDate, item.endDate);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.row}
                  onPress={() => Alert.alert('Detail', 'Mock: detail cuti belum dibuat.')}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.rowTitleLine}>
                      <View style={[styles.iconCircle, { backgroundColor: ValuateColors.primary + '14' }]}>
                        <IconSymbol name="calendar.badge.minus" size={20} color={ValuateColors.primary} />
                      </View>
                      <View style={styles.rowTextWrap}>
                        <Text style={styles.rowTitle}>{item.title}</Text>
                        <Text style={styles.rowSubtitle}>{item.subtitle} • {range}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.rowRight}>
                    <View style={[styles.statusPill, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                      <Text style={[styles.statusText, { color }]}>{item.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text.magnifyingglass" size={48} color={ValuateColors.text.light} />
              <Text style={styles.emptyStateText}>Belum ada pengajuan cuti</Text>
            </View>
          )}
        </View>

        <View style={{ height: Platform.OS === 'ios' ? 20 : 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ValuateColors.navBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: ValuateColors.border,
    backgroundColor: ValuateColors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ValuateColors.text.primary,
  },
  content: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: ValuateColors.primary,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  card: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ValuateColors.border,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ValuateColors.text.primary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: ValuateColors.border,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ValuateColors.text.primary,
  },
  rowSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ValuateColors.text.secondary,
    marginTop: 4,
  },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 14,
    color: ValuateColors.text.light,
    marginTop: 10,
    textAlign: 'center',
  },
  loadingState: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default withProtectedRoute(LeaveScreen, 'LeaveScreen');
