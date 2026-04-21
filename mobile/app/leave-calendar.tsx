import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';

type LeaveSchedule = {
  id: string;
  staffName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
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

const WEEKDAYS = ['M', 'S', 'S', 'R', 'K', 'J', 'S'] as const;

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateInRange(date: Date, start: Date, end: Date) {
  const d = normalizeDate(date).getTime();
  const s = normalizeDate(start).getTime();
  const e = normalizeDate(end).getTime();
  return d >= s && d <= e;
}

function formatListDate(date: Date) {
  return date.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function formatRange(start: Date, end: Date) {
  const startLabel = start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const endLabel = end.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

// 1. MODIFIKASI: Grid dinamis untuk menyesuaikan baris minggu pertama dan terakhir saja
function buildMonthGrid(monthStart: Date) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0); // Mendapatkan hari terakhir di bulan ini

  const firstDayIndex = firstDay.getDay(); // 0 (Minggu) - 6 (Sabtu)
  const lastDayIndex = lastDay.getDay();

  const cells: Date[] = [];
  
  // Tanggal dari bulan sebelumnya untuk melengkapi minggu pertama
  for (let i = firstDayIndex; i > 0; i--) {
    cells.push(normalizeDate(new Date(year, month, 1 - i)));
  }
  
  // Tanggal di bulan saat ini
  for (let i = 1; i <= lastDay.getDate(); i++) {
    cells.push(normalizeDate(new Date(year, month, i)));
  }
  
  // Tanggal dari bulan berikutnya untuk melengkapi minggu terakhir (hingga Sabtu)
  const daysToAdd = 6 - lastDayIndex;
  for (let i = 1; i <= daysToAdd; i++) {
    cells.push(normalizeDate(new Date(year, month, lastDay.getDate() + i)));
  }
  
  return cells;
}

export default function LeaveCalendarScreen() {
  // 3. Tanggal default hari ini sudah tertangani oleh inisialisasi ini
  const today = useMemo(() => normalizeDate(new Date()), []);

  const schedules = useMemo<LeaveSchedule[]>(() => {
    const y = today.getFullYear();
    const m = today.getMonth();

    return [
      {
        id: 's-1',
        staffName: 'Kamu',
        leaveType: 'Cuti Tahunan',
        startDate: new Date(y, m, Math.max(1, today.getDate() + 2)),
        endDate: new Date(y, m, Math.max(1, today.getDate() + 4)),
      },
      {
        id: 's-2',
        staffName: 'Budi',
        leaveType: 'Izin',
        startDate: new Date(y, m, Math.max(1, today.getDate() + 1)),
        endDate: new Date(y, m, Math.max(1, today.getDate() + 1)),
      },
      {
        id: 's-3',
        staffName: 'Siti',
        leaveType: 'Cuti Sakit',
        startDate: new Date(y, m, Math.max(1, today.getDate() - 3)),
        endDate: new Date(y, m, Math.max(1, today.getDate() - 2)),
      },
    ].map(s => ({ ...s, startDate: normalizeDate(s.startDate), endDate: normalizeDate(s.endDate) }));
  }, [today]);

  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today); // Default state: Hari ini

  const monthTitle = useMemo(() => {
    return `${MONTHS_ID[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  }, [currentMonth]);

  const grid = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

  const selectedSchedules = useMemo(() => {
    return schedules
      .filter(s => dateInRange(selectedDate, s.startDate, s.endDate))
      .sort((a, b) => a.staffName.localeCompare(b.staffName));
  }, [schedules, selectedDate]);

  const hasScheduleOnDate = (date: Date) => {
    return schedules.some(s => dateInRange(date, s.startDate, s.endDate));
  };

  const goPrev = () => {
    const next = addMonths(currentMonth, -1);
    setCurrentMonth(next);
    // Opsional: Anda bisa menghapus baris di bawah jika tidak ingin reset tanggal terpilih ke tanggal 1 tiap kali ganti bulan
    setSelectedDate(normalizeDate(next)); 
  };

  const goNext = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    // Opsional: Anda bisa menghapus baris di bawah jika tidak ingin reset tanggal terpilih ke tanggal 1 tiap kali ganti bulan
    setSelectedDate(normalizeDate(next));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kalender Cuti</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.monthTitle}>{monthTitle}</Text>
            <View style={styles.navButtons}>
              <TouchableOpacity style={styles.navButton} onPress={goPrev}>
                <IconSymbol name="chevron.left" size={18} color={ValuateColors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={goNext}>
                <IconSymbol name="chevron.right" size={18} color={ValuateColors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.weekdays}>
            {WEEKDAYS.map((d, idx) => (
              <Text key={`${d}-${idx}`} style={styles.weekdayText}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {grid.map(date => {
              const isOtherMonth = date.getMonth() !== currentMonth.getMonth();
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);
              const hasLeave = hasScheduleOnDate(date);

              const dayNumStyle = [
                styles.dayNum,
                hasLeave && !isSelected && styles.dayNumHasLeave, // Terapkan background kuning jika ada cuti
                isSelected && styles.dayNumSelected,
              ];

              const dayTextStyle = [
                styles.dayText,
                isOtherMonth && styles.dayTextOtherMonth,
                isSelected && styles.dayTextSelected,
                hasLeave && !isSelected && styles.dayTextHasLeave, // Terapkan teks kontras jika ada cuti
                isToday && !isSelected && !hasLeave && styles.dayTextToday,
              ];

              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[styles.dayCell, isOtherMonth && styles.dayCellOtherMonth]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.8}
                >
                  <View style={dayNumStyle}>
                    <Text style={dayTextStyle}>{date.getDate()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.listDate}>{formatListDate(selectedDate)}</Text>

            {selectedSchedules.length > 0 ? (
              selectedSchedules.map(s => (
                <View key={s.id} style={styles.listItem}>
                  <Text style={styles.listName}>{s.staffName}</Text>
                  <Text style={styles.listMeta}>{s.leaveType} • {formatRange(s.startDate, s.endDate)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItems}>Tidak ada jadwal cuti.</Text>
            )}
          </View>
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
  card: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ValuateColors.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ValuateColors.text.primary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ValuateColors.secondaryBackground,
    borderWidth: 1,
    borderColor: ValuateColors.border,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  weekdayText: {
    width: 32,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: ValuateColors.text.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Diubah agar alignment flex wrap lebih mulus tanpa renggang tidak wajar
    gap: 0, // Fallback, margin/padding ditangani oleh width persentase
  },
  dayCell: {
    width: '14.28%', // 100% dibagi 7 hari agar selalu presisi dalam row
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dayCellOtherMonth: {
    opacity: 0.35,
  },
  dayNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // 2. MODIFIKASI: Styling warna highlight kuning untuk tanggal yang memiliki cuti
  dayNumHasLeave: {
    backgroundColor: '#FEF08A', // Background kuning cerah (Tailwind Yellow 200)
  },
  dayNumSelected: {
    backgroundColor: ValuateColors.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '800',
    color: ValuateColors.text.primary,
  },
  dayTextOtherMonth: {
    color: ValuateColors.text.light,
  },
  dayTextToday: {
    fontWeight: '900',
    color: ValuateColors.primary, // Membedakan hari ini dengan warna primary
  },
  dayTextHasLeave: {
    color: '#A16207', // Teks cokelat gelap/kuning gelap untuk kontras
  },
  dayTextSelected: {
    color: 'white',
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: ValuateColors.border,
    paddingTop: 14,
  },
  listDate: {
    fontSize: 14,
    fontWeight: '900',
    color: ValuateColors.primary,
    marginBottom: 10,
  },
  listItem: {
    marginBottom: 14,
  },
  listName: {
    fontSize: 13,
    fontWeight: '900',
    color: ValuateColors.text.primary,
  },
  listMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: ValuateColors.text.secondary,
  },
  noItems: {
    fontSize: 13,
    fontWeight: '700',
    color: ValuateColors.text.light,
    fontStyle: 'italic',
  },
});