import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';
import { withProtectedRoute } from '@/components/ProtectedRoute';
import { leaveService } from '@/services/leaveService';

const TYPES = ['Cuti Tahunan', 'Cuti Sakit', 'Izin'] as const;

type LeaveType = (typeof TYPES)[number];

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

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function clampDay(year: number, monthIndex: number, day: number) {
  return Math.min(day, daysInMonth(year, monthIndex));
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function LeaveFormScreen() {
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => normalizeDate(now), [now]);

  const [type, setType] = useState<LeaveType | null>(null);
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(today);
  const [reason, setReason] = useState('');

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>('start');
  const [tempYear, setTempYear] = useState<number>(today.getFullYear());
  const [tempMonth, setTempMonth] = useState<number>(today.getMonth());
  const [tempDay, setTempDay] = useState<number>(today.getDate());
  const [activeDatePart, setActiveDatePart] = useState<'day' | 'month' | 'year'>('day');
  const [datePartOptionsOpen, setDatePartOptionsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const years = useMemo(() => {
    const y = today.getFullYear();
    return Array.from({ length: 4 }, (_, i) => y + i);
  }, [today]);

  const minSelectableDate = useMemo(() => {
    const base = datePickerTarget === 'start' ? today : normalizeDate(startDate);
    return base.getTime() < today.getTime() ? today : base;
  }, [datePickerTarget, startDate, today]);

  const minYear = minSelectableDate.getFullYear();
  const minMonth = minSelectableDate.getMonth();
  const minDay = minSelectableDate.getDate();

  const monthsForTempYear = useMemo(() => {
    const startIdx = tempYear === minYear ? minMonth : 0;
    return MONTHS_ID.slice(startIdx).map((label, i) => ({ label, index: startIdx + i }));
  }, [tempYear, minYear, minMonth]);

  const daysForTempMonth = useMemo(() => {
    const start = tempYear === minYear && tempMonth === minMonth ? minDay : 1;
    const end = daysInMonth(tempYear, tempMonth);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  }, [tempYear, tempMonth, minYear, minMonth, minDay]);

  const openDatePicker = (target: 'start' | 'end') => {
    setDatePickerTarget(target);
    setActiveDatePart('day');

    const base = target === 'start' ? startDate : endDate;
    const baseNorm = normalizeDate(base);
    const min = target === 'start' ? today : normalizeDate(startDate);
    const minNorm = min.getTime() < today.getTime() ? today : min;
    const initial = baseNorm.getTime() < minNorm.getTime() ? minNorm : baseNorm;

    setTempYear(initial.getFullYear());
    setTempMonth(initial.getMonth());
    setTempDay(initial.getDate());
    setDatePickerOpen(true);
  };

  const confirmDatePicker = () => {
    const day = clampDay(tempYear, tempMonth, tempDay);
    const picked = normalizeDate(new Date(tempYear, tempMonth, day));

    if (datePickerTarget === 'start') {
      setStartDate(picked);
      if (picked.getTime() > endDate.getTime()) setEndDate(picked);
    } else {
      setEndDate(picked);
      if (picked.getTime() < startDate.getTime()) setStartDate(picked);
    }

    setDatePickerOpen(false);
  };

  const openDatePartOptions = (part: 'day' | 'month' | 'year') => {
    setActiveDatePart(part);
    setDatePartOptionsOpen(true);
  };

  const mapReason = (leaveType: LeaveType) => {
    switch (leaveType) {
      case 'Cuti Tahunan':
        return 'vacation';
      case 'Cuti Sakit':
        return 'sick leave';
      case 'Izin':
      default:
        return 'personal leave';
    }
  };

  const submit = async () => {
    if (!type) {
      Alert.alert('Validasi', 'Pilih jenis cuti.');
      return;
    }
    if (normalizeDate(startDate).getTime() > normalizeDate(endDate).getTime()) {
      Alert.alert('Validasi', 'Tanggal mulai harus sebelum / sama dengan tanggal selesai.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Validasi', 'Isi alasan cuti.');
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      await leaveService.createLeave({
        reason: mapReason(type),
        startDate: normalizeDate(startDate).toISOString(),
        endDate: normalizeDate(endDate).toISOString(),
      });

      Alert.alert('Berhasil', 'Pengajuan cuti berhasil dikirim.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Gagal', error?.message || 'Pengajuan cuti gagal dikirim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajukan Cuti</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.label}>Jenis Cuti</Text>
            <TouchableOpacity style={styles.selectField} onPress={() => setTypePickerOpen(true)}>
              <Text style={[styles.selectText, !type && styles.placeholderText]}>{type ?? 'Pilih jenis'}</Text>
              <IconSymbol name="chevron.down" size={18} color={ValuateColors.text.secondary} />
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 14 }]}>Tanggal Mulai</Text>
            <TouchableOpacity style={styles.selectField} onPress={() => openDatePicker('start')}>
              <Text style={styles.selectText}>{formatShortDate(startDate)}</Text>
              <IconSymbol name="calendar" size={18} color={ValuateColors.text.secondary} />
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 14 }]}>Tanggal Selesai</Text>
            <TouchableOpacity style={styles.selectField} onPress={() => openDatePicker('end')}>
              <Text style={styles.selectText}>{formatShortDate(endDate)}</Text>
              <IconSymbol name="calendar" size={18} color={ValuateColors.text.secondary} />
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 14 }]}>Alasan</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Contoh: urusan keluarga"
              placeholderTextColor={ValuateColors.text.light}
              style={[styles.input, styles.multiline]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Kirim Pengajuan</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: Platform.OS === 'ios' ? 20 : 10 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={typePickerOpen} transparent animationType="fade" onRequestClose={() => setTypePickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setTypePickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Pilih Jenis</Text>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.modalItem, t === type && styles.modalItemActive]}
                onPress={() => {
                  setType(t);
                  setTypePickerOpen(false);
                }}
              >
                <Text style={[styles.modalItemText, t === type && styles.modalItemTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={datePickerOpen} transparent animationType="fade" onRequestClose={() => setDatePickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDatePickerOpen(false)}>
          <Pressable style={styles.modalCardLarge} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              Pilih Tanggal {datePickerTarget === 'start' ? 'Mulai' : 'Selesai'}
            </Text>

            <View style={styles.dropdownGroup}>
              <View style={styles.dropdownRow}>
                <Text style={styles.dropdownLabel}>Tanggal</Text>
                <TouchableOpacity style={styles.selectField} onPress={() => openDatePartOptions('day')}>
                  <Text style={styles.selectText}>{tempDay}</Text>
                  <IconSymbol name="chevron.down" size={18} color={ValuateColors.text.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.dropdownRow}>
                <Text style={styles.dropdownLabel}>Bulan</Text>
                <TouchableOpacity style={styles.selectField} onPress={() => openDatePartOptions('month')}>
                  <Text style={styles.selectText}>{MONTHS_ID[tempMonth]}</Text>
                  <IconSymbol name="chevron.down" size={18} color={ValuateColors.text.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.dropdownRow}>
                <Text style={styles.dropdownLabel}>Tahun</Text>
                <TouchableOpacity style={styles.selectField} onPress={() => openDatePartOptions('year')}>
                  <Text style={styles.selectText}>{tempYear}</Text>
                  <IconSymbol name="chevron.down" size={18} color={ValuateColors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={confirmDatePicker}>
              <Text style={styles.confirmButtonText}>Pilih</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={datePickerOpen && datePartOptionsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePartOptionsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDatePartOptionsOpen(false)}>
          <Pressable style={styles.modalCardLarge} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {activeDatePart === 'day' ? 'Pilih Tanggal' : activeDatePart === 'month' ? 'Pilih Bulan' : 'Pilih Tahun'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsList}>
              {activeDatePart === 'day' &&
                daysForTempMonth.map(d => (
                  <TouchableOpacity
                    key={String(d)}
                    style={[styles.modalItem, d === tempDay && styles.modalItemActive]}
                    onPress={() => {
                      setTempDay(d);
                      setDatePartOptionsOpen(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, d === tempDay && styles.modalItemTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}

              {activeDatePart === 'month' &&
                monthsForTempYear.map(({ label, index }) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.modalItem, index === tempMonth && styles.modalItemActive]}
                    onPress={() => {
                      setTempMonth(index);
                      const clamped = clampDay(tempYear, index, tempDay);
                      const floor = tempYear === minYear && index === minMonth ? minDay : 1;
                      setTempDay(Math.max(floor, clamped));
                      setDatePartOptionsOpen(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, index === tempMonth && styles.modalItemTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}

              {activeDatePart === 'year' &&
                years
                  .filter(y => y >= minYear)
                  .map(y => (
                    <TouchableOpacity
                      key={String(y)}
                      style={[styles.modalItem, y === tempYear && styles.modalItemActive]}
                      onPress={() => {
                        const nextYear = y;
                        const nextMonth = nextYear === minYear ? Math.max(tempMonth, minMonth) : tempMonth;
                        const clamped = clampDay(nextYear, nextMonth, tempDay);
                        const floor = nextYear === minYear && nextMonth === minMonth ? minDay : 1;

                        setTempYear(nextYear);
                        setTempMonth(nextMonth);
                        setTempDay(Math.max(floor, clamped));
                        setDatePartOptionsOpen(false);
                      }}
                    >
                      <Text style={[styles.modalItemText, y === tempYear && styles.modalItemTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
            </ScrollView>

            <TouchableOpacity style={styles.confirmButton} onPress={() => setDatePartOptionsOpen(false)}>
              <Text style={styles.confirmButtonText}>Tutup</Text>
            </TouchableOpacity>
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
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: ValuateColors.text.primary,
    marginBottom: 8,
  },
  selectField: {
    height: 48,
    borderRadius: 12,
    backgroundColor: ValuateColors.background,
    borderWidth: 1,
    borderColor: ValuateColors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 14,
    fontWeight: '700',
    color: ValuateColors.text.primary,
  },
  placeholderText: {
    color: ValuateColors.text.light,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: ValuateColors.background,
    borderWidth: 1,
    borderColor: ValuateColors.border,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: ValuateColors.text.primary,
  },
  multiline: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: ValuateColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
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
  },
  modalCardLarge: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
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
    fontWeight: '800',
    color: ValuateColors.text.primary,
  },
  modalItemTextActive: {
    color: ValuateColors.primary,
  },
  dropdownGroup: {
    gap: 10,
  },
  dropdownRow: {
    gap: 8,
  },
  dropdownLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: ValuateColors.text.secondary,
  },
  optionsList: {
    maxHeight: 260,
  },
  confirmButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: ValuateColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default withProtectedRoute(LeaveFormScreen, 'LeaveFormScreen');
