import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';

const TYPES = ['Transport', 'Makan', 'ATK', 'Lainnya'] as const;

type ReimburseType = (typeof TYPES)[number];

function digitsOnly(value: string) {
  return value.replace(/[^0-9]/g, '');
}

function formatIDRFromDigits(digits: string) {
  const amount = Number(digits || '0');
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `Rp ${amount}`;
  }
}

export default function ReimburseFormScreen() {
  const now = useMemo(() => new Date(), []);
  const dateLabel = useMemo(
    () => now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    [now]
  );

  const [type, setType] = useState<ReimburseType | null>(null);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [amountDigits, setAmountDigits] = useState('');
  const [description, setDescription] = useState('');

  const submit = () => {
    const amount = Number(amountDigits || '0');

    if (!type) {
      Alert.alert('Validasi', 'Pilih jenis reimbursement.');
      return;
    }
    if (!amount || amount <= 0) {
      Alert.alert('Validasi', 'Masukkan nominal reimbursement.');
      return;
    }

    Alert.alert('Berhasil', 'Pengajuan reimbursement berhasil dikirim (mock).', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={22} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajukan Reimbursement</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.label}>Tanggal Pengajuan</Text>
            <View style={styles.readOnlyField}>
              <IconSymbol name="calendar" size={18} color={ValuateColors.text.secondary} />
              <Text style={styles.readOnlyText}>{dateLabel}</Text>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Jenis Reimbursement</Text>
            <TouchableOpacity style={styles.selectField} onPress={() => setTypePickerOpen(true)}>
              <Text style={[styles.selectText, !type && styles.placeholderText]}>{type ?? 'Pilih jenis'}</Text>
              <IconSymbol name="chevron.down" size={18} color={ValuateColors.text.secondary} />
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 14 }]}>Nominal</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={amountDigits}
                onChangeText={t => setAmountDigits(digitsOnly(t))}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                placeholder="0"
                placeholderTextColor={ValuateColors.text.light}
                style={styles.input}
              />
              <Text style={styles.helperText}>{formatIDRFromDigits(amountDigits)}</Text>
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Deskripsi (opsional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Contoh: Kunjungan proyek"
              placeholderTextColor={ValuateColors.text.light}
              style={[styles.input, styles.multiline]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitButton} onPress={submit}>
              <Text style={styles.submitButtonText}>Kirim Pengajuan</Text>
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
  readOnlyField: {
    height: 48,
    borderRadius: 12,
    backgroundColor: ValuateColors.secondaryBackground,
    borderWidth: 1,
    borderColor: ValuateColors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readOnlyText: {
    fontSize: 14,
    fontWeight: '700',
    color: ValuateColors.text.secondary,
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
  inputWrap: {
    borderRadius: 12,
    backgroundColor: ValuateColors.background,
    borderWidth: 1,
    borderColor: ValuateColors.border,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    fontSize: 14,
    fontWeight: '700',
    color: ValuateColors.text.primary,
    paddingVertical: 0,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: ValuateColors.text.secondary,
  },
  multiline: {
    minHeight: 100,
    borderRadius: 12,
    backgroundColor: ValuateColors.background,
    borderWidth: 1,
    borderColor: ValuateColors.border,
    paddingHorizontal: 12,
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
});
