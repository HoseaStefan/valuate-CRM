import React, { useMemo } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';
import { withProtectedRoute } from '@/components/ProtectedRoute';

type ReimburseStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

type ReimburseItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  submittedAt: Date;
  status: ReimburseStatus;
};

function statusColor(status: ReimburseStatus) {
  switch (status) {
    case 'Disetujui':
      return ValuateColors.success;
    case 'Menunggu':
      return ValuateColors.warning;
    case 'Ditolak':
      return ValuateColors.error;
  }
}

function formatIDR(amount: number) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `Rp ${amount}`;
  }
}

function ReimburseScreen() {
  const data = useMemo<ReimburseItem[]>(() => {
    const now = new Date();
    const items: ReimburseItem[] = [
      {
        id: 'r-3',
        title: 'Reimburse Transport',
        subtitle: 'Kunjungan Proyek',
        amount: 75000,
        submittedAt: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 1)),
        status: 'Disetujui',
      },
      {
        id: 'r-2',
        title: 'Reimburse Makan',
        subtitle: 'Lembur',
        amount: 45000,
        submittedAt: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 3)),
        status: 'Menunggu',
      },
      {
        id: 'r-1',
        title: 'Reimburse ATK',
        subtitle: 'Pembelian operasional',
        amount: 120000,
        submittedAt: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 7)),
        status: 'Ditolak',
      },
    ];

    // 2. Return variabel yang sudah di-sort
    return items.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reimbursement</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/reimburse-form' as any)}>
          <IconSymbol name="plus" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Ajukan Reimbursement</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Riwayat Pengajuan</Text>

          {data.length > 0 ? (
            data.map(item => {
              const color = statusColor(item.status);
              const dateLabel = item.submittedAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.row}
                  onPress={() => Alert.alert('Detail', 'Mock: detail reimbursement belum dibuat.')}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.rowTitleLine}>
                      <View style={[styles.iconCircle, { backgroundColor: ValuateColors.primary + '14' }]}>
                        <IconSymbol name="doc.text.fill" size={20} color={ValuateColors.primary} />
                      </View>
                      <View style={styles.rowTextWrap}>
                        <Text style={styles.rowTitle}>{item.title}</Text>
                        <Text style={styles.rowSubtitle}>{item.subtitle} • {dateLabel}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.rowRight}>
                    <Text style={styles.amountText}>{formatIDR(item.amount)}</Text>
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
              <Text style={styles.emptyStateText}>Belum ada pengajuan reimbursement</Text>
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
    gap: 6,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
    color: ValuateColors.text.primary,
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
});

export default withProtectedRoute(ReimburseScreen, 'ReimburseScreen');
