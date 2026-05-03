import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';

const parseParam = (value?: string | string[]) => {
  if (!value) return '';
  return Array.isArray(value) ? value[0] : value;
};

const statusColor = (status: string) => {
  switch (status) {
    case 'Disetujui':
      return ValuateColors.success;
    case 'Ditolak':
      return ValuateColors.error;
    default:
      return ValuateColors.warning;
  }
};

const formatIDR = (amount: number) => {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `Rp ${amount}`;
  }
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ReimburseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = parseParam(params.title);
  const subtitle = parseParam(params.subtitle);
  const amount = Number(parseParam(params.amount));
  const status = parseParam(params.status) || 'Menunggu';
  const submittedAt = parseParam(params.submittedAt);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Reimbursement</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={[styles.iconCircle, { backgroundColor: ValuateColors.primary + '14' }]}>
              <IconSymbol name="doc.text.fill" size={20} color={ValuateColors.primary} />
            </View>
            <View style={styles.titleText}>
              <Text style={styles.title}>{title || 'Reimbursement'}</Text>
              <Text style={styles.subtitle}>{subtitle || 'Reimbursement'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nominal</Text>
            <Text style={styles.detailValue}>{formatIDR(Number.isNaN(amount) ? 0 : amount)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tanggal Pengajuan</Text>
            <Text style={styles.detailValue}>{submittedAt ? formatDate(submittedAt) : '-'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusPill, { backgroundColor: statusColor(status) + '20', borderColor: statusColor(status) + '40' }]}
            >
              <Text style={[styles.statusText, { color: statusColor(status) }]}>{status}</Text>
            </View>
          </View>
        </View>
      </View>
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
  },
  card: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ValuateColors.border,
    padding: 16,
  },
  titleRow: {
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
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: ValuateColors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ValuateColors.text.secondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: ValuateColors.border,
    marginVertical: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ValuateColors.text.secondary,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: ValuateColors.text.primary,
  },
  statusPill: {
    alignSelf: 'flex-start',
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
});
