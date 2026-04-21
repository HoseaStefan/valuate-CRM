import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';

type AttendanceStatus = 'Hadir' | 'Telat' | 'Izin' | 'Sakit' | 'Libur';

type AttendanceItem = {
  id: string;
  date: Date;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
};

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const WEEKDAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildAttendanceForMonth(year: number, monthIndex: number, maxDay?: number): AttendanceItem[] {
  const totalDays = daysInMonth(year, monthIndex);
  const endDay = Math.max(1, Math.min(maxDay ?? totalDays, totalDays));

  const items: AttendanceItem[] = [];
  for (let day = endDay; day >= 1; day -= 1) {
    const date = new Date(year, monthIndex, day);
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    // Cukup tampilkan hari yang memang ada aktivitas absen (check-in / check-out).
    if (isWeekend) continue;

    let status: AttendanceStatus = 'Hadir';
    if (day % 11 === 0) status = 'Izin';
    else if (day % 9 === 0) status = 'Sakit';
    else if (day % 7 === 0) status = 'Telat';

    if (status !== 'Hadir' && status !== 'Telat') continue;

    const checkIn = status === 'Hadir' ? '08:00' : status === 'Telat' ? '08:17' : undefined;
    const checkOut = status === 'Hadir' || status === 'Telat' ? '17:00' : undefined;

    items.push({
      id: `${year}-${monthIndex + 1}-${day}`,
      date,
      status,
      checkIn,
      checkOut,
    });
  }

  return items;
}

function statusColor(status: AttendanceStatus) {
  switch (status) {
    case 'Hadir':
      return ValuateColors.success;
    case 'Telat':
      return ValuateColors.warning;
    case 'Izin':
      return ValuateColors.primary;
    case 'Sakit':
      return ValuateColors.error;
    case 'Libur':
      return ValuateColors.text.light;
  }
}

export default function AttendanceScreen() {
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  const [monthIndex, setMonthIndex] = useState(currentMonthIndex);
  const [year, setYear] = useState(currentYear);

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  const years = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => currentYear - 3 + i);
  }, [currentYear]);

  const monthsForSelectedYear = useMemo(() => {
    const end = year === currentYear ? currentMonthIndex : 11;
    return MONTHS_ID.slice(0, end + 1).map((label, idx) => ({ label, index: idx }));
  }, [year, currentYear, currentMonthIndex]);

  const maxDayForSelection = useMemo(() => {
    if (year !== currentYear) return undefined;
    if (monthIndex !== currentMonthIndex) return undefined;
    return currentDay;
  }, [year, monthIndex, currentYear, currentMonthIndex, currentDay]);

  const data = useMemo(() => {
    if (year > currentYear) return [];
    if (year === currentYear && monthIndex > currentMonthIndex) return [];
    return buildAttendanceForMonth(year, monthIndex, maxDayForSelection);
  }, [year, monthIndex, currentYear, currentMonthIndex, maxDayForSelection]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Absensi</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterChip} onPress={() => setMonthPickerOpen(true)}>
          <IconSymbol name="calendar" size={18} color={ValuateColors.text.secondary} />
          <Text style={styles.filterText}>{MONTHS_ID[monthIndex]}</Text>
          <IconSymbol name="chevron.down" size={18} color={ValuateColors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterChip} onPress={() => setYearPickerOpen(true)}>
          <Text style={styles.filterText}>{year}</Text>
          <IconSymbol name="chevron.down" size={18} color={ValuateColors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {data.length > 0 ? (
          data.map(item => {
            const day = item.date.getDate();
            const weekday = WEEKDAYS_ID[item.date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6];
            const color = statusColor(item.status);

            return (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowDate}>{weekday}, {day}</Text>
                  <Text style={styles.rowTime}>{`${item.checkIn} - ${item.checkOut}`}</Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: color + '20', borderColor: color + '40' }]}>
                  <Text style={[styles.statusText, { color }]}>{item.status}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text.magnifyingglass" size={48} color={ValuateColors.text.light} />
            <Text style={styles.emptyStateText}>Belum ada data absensi</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={monthPickerOpen} transparent animationType="fade" onRequestClose={() => setMonthPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMonthPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Pilih Bulan</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {monthsForSelectedYear.map(({ label, index }) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.modalItem, index === monthIndex && styles.modalItemActive]}
                  onPress={() => {
                    setMonthIndex(index);
                    setMonthPickerOpen(false);
                  }}
                >
                  <Text style={[styles.modalItemText, index === monthIndex && styles.modalItemTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={yearPickerOpen} transparent animationType="fade" onRequestClose={() => setYearPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setYearPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Pilih Tahun</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {years.map(y => (
                <TouchableOpacity
                  key={String(y)}
                  style={[styles.modalItem, y === year && styles.modalItemActive]}
                  onPress={() => {
                    setYear(y);
                    if (y === currentYear && monthIndex > currentMonthIndex) {
                      setMonthIndex(currentMonthIndex);
                    }
                    setYearPickerOpen(false);
                  }}
                >
                  <Text style={[styles.modalItemText, y === year && styles.modalItemTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
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
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ValuateColors.contentBackground,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: ValuateColors.cardBackground,
    borderWidth: 1,
    borderColor: ValuateColors.border,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: ValuateColors.text.secondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: ValuateColors.border,
  },
  rowLeft: {
    flex: 1,
  },
  rowDate: {
    fontSize: 15,
    fontWeight: '700',
    color: ValuateColors.text.primary,
  },
  rowTime: {
    fontSize: 13,
    fontWeight: '600',
    color: ValuateColors.text.secondary,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ValuateColors.text.primary,
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  modalItemActive: {
    backgroundColor: ValuateColors.secondaryBackground,
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: ValuateColors.text.primary,
  },
  modalItemTextActive: {
    color: ValuateColors.primary,
  },
});
