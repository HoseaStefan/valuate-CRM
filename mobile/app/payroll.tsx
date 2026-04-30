import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { withProtectedRoute } from '@/components/ProtectedRoute';

interface PayrollItem {
  id: string;
  month: string;
  monthNumber: number;
  year: number;
  salary: number;
  deductions: number;
  netSalary: number;
  status: 'Processed' | 'Pending' | 'Error';
}

function PayrollScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxYear] = useState<number>(new Date().getFullYear());

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading]);

  // Fetch payroll data when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchPayrollData(selectedYear);
    }
  }, [selectedYear]);

  const fetchPayrollData = async (year: number) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/payroll?year=${year}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData: PayrollItem[] = [
        { id: '1', month: 'Januari', monthNumber: 1, year, salary: 5000000, deductions: 500000, netSalary: 4500000, status: 'Processed' },
        { id: '2', month: 'Februari', monthNumber: 2, year, salary: 5000000, deductions: 500000, netSalary: 4500000, status: 'Processed' },
        { id: '3', month: 'Maret', monthNumber: 3, year, salary: 5000000, deductions: 500000, netSalary: 4500000, status: 'Processed' },
        { id: '4', month: 'April', monthNumber: 4, year, salary: 5000000, deductions: 500000, netSalary: 4500000, status: 'Processed' },
        { id: '5', month: 'Mei', monthNumber: 5, year, salary: 5000000, deductions: 500000, netSalary: 4500000, status: 'Processed' },
        { id: '6', month: 'Juni', monthNumber: 6, year, salary: 5000000, deductions: 500000, netSalary: 4500000, status: 'Pending' },
      ];
      
      setPayrollData(mockData);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed':
        return ValuateColors.success;
      case 'Pending':
        return ValuateColors.warning;
      case 'Error':
        return ValuateColors.error;
      default:
        return ValuateColors.text.secondary;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderPayrollItem = ({ item }: { item: PayrollItem }) => (
    <TouchableOpacity style={styles.payrollItem} onPress={() => {
      // TODO: Navigate to payroll detail page
    }}>
      <View style={styles.payrollItemLeft}>
        <View style={styles.monthIcon}>
          <IconSymbol name="doc.text.fill" size={24} color={ValuateColors.primary} />
        </View>
        <View style={styles.monthInfo}>
          <Text style={styles.monthName}>{item.month}</Text>
          <Text style={styles.monthYear}>{item.year}</Text>
        </View>
      </View>
      
      <View style={styles.payrollItemRight}>
        <Text style={styles.netSalary}>{formatCurrency(item.netSalary)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (authLoading || !isAuthenticated) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payroll</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Pilih Tahun:</Text>
        <View style={styles.yearPickerContainer}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
            style={styles.yearPicker}
          >
            {Array.from({ length: 5 }, (_, i) => maxYear - i).map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ValuateColors.primary} />
        </View>
      ) : payrollData.length > 0 ? (
        <FlatList
          data={payrollData}
          renderItem={renderPayrollItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyState}>
          <IconSymbol name="doc.text.magnifyingglass" size={48} color={ValuateColors.text.light} />
          <Text style={styles.emptyStateText}>Belum ada data payroll untuk tahun ini</Text>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: ValuateColors.text.light + '20',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ValuateColors.text.primary,
  },
  filterSection: {
    backgroundColor: ValuateColors.cardBackground,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: ValuateColors.text.secondary,
    marginBottom: 12,
  },
  yearPickerContainer: {
    borderWidth: 1,
    borderColor: ValuateColors.text.light + '30',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: ValuateColors.navBackground,
  },
  yearPicker: {
    height: 50,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  payrollItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ValuateColors.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  payrollItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  monthIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: ValuateColors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  monthInfo: {
    justifyContent: 'center',
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
    color: ValuateColors.text.primary,
  },
  monthYear: {
    fontSize: 12,
    color: ValuateColors.text.secondary,
    marginTop: 2,
  },
  payrollItemRight: {
    alignItems: 'flex-end',
  },
  netSalary: {
    fontSize: 16,
    fontWeight: '700',
    color: ValuateColors.primary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: ValuateColors.text.light,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default withProtectedRoute(PayrollScreen, 'PayrollScreen');
