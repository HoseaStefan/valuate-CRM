import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ValuateColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { withProtectedRoute } from '@/components/ProtectedRoute';
import { useFocusEffect } from '@react-navigation/native';
import { managerService } from '@/services/managerService';

interface StaffRequest {
  id: string;
  staffName: string;
  staffID: string;
  type: 'Reimburse' | 'Cuti';
  title: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}

type FilterType = 'All' | 'Pending' | 'Approved' | 'Rejected';

function RequestScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [requestsData, setRequestsData] = useState<StaffRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<StaffRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Pending');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    const checkManager = async () => {
      if (!isAuthenticated) return;
      try {
        const status = await managerService.getManagerStatus();
        setIsManager(status.isManager);
      } catch (error) {
        console.log('[Request] Error checking manager status:', error);
        setIsManager(false);
      }
    };

    checkManager();
  }, [isAuthenticated]);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests when filter changes
  useEffect(() => {
    if (selectedFilter === 'All') {
      setFilteredRequests(requestsData);
    } else {
      setFilteredRequests(requestsData.filter(req => req.status === selectedFilter));
    }
  }, [selectedFilter, requestsData]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const [leaveRequests, reimburseRequests] = await Promise.all([
        managerService.getLeaveRequests(),
        managerService.getReimbursementRequests(),
      ]);

      const mappedLeaves: StaffRequest[] = leaveRequests.map((item) => ({
        id: `leave-${item.id}`,
        staffName: item.user?.fullName || 'Staff',
        staffID: `EMP-${item.user?.id ?? item.id}`,
        type: 'Cuti',
        title: 'Pengajuan Cuti',
        startDate: item.startDate,
        endDate: item.endDate,
        reason: item.reason,
        status: item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending',
        requestDate: item.createdAt || item.startDate,
      }));

      const mappedReimburse: StaffRequest[] = reimburseRequests.map((item) => ({
        id: `reimburse-${item.id}`,
        staffName: item.user?.fullName || 'Staff',
        staffID: `EMP-${item.user?.id ?? item.id}`,
        type: 'Reimburse',
        title: item.title,
        amount: Number(item.amount),
        reason: item.description || 'Reimbursement',
        status: item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending',
        requestDate: item.createdAt,
      }));

      const merged = [...mappedLeaves, ...mappedReimburse].sort(
        (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime(),
      );

      setRequestsData(merged);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequestsData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  const handleApprove = async (requestId: string) => {
    Alert.alert('Setujui Request', 'Apakah Anda yakin ingin menyetujui request ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Setujui',
        onPress: async () => {
          try {
            if (requestId.startsWith('leave-')) {
              const id = Number(requestId.replace('leave-', ''));
              await managerService.reviewLeave(id, 'approve');
            } else {
              const id = Number(requestId.replace('reimburse-', ''));
              await managerService.reviewReimbursement(id, 'approved');
            }

            await fetchRequests();
            setSelectedRequestId(null);
            Alert.alert('Berhasil', 'Request telah disetujui');
          } catch (error) {
            Alert.alert('Error', 'Gagal menyetujui request');
          }
        },
      },
    ]);
  };

  const handleReject = async (requestId: string) => {
    Alert.alert('Tolak Request', 'Apakah Anda yakin ingin menolak request ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Tolak',
        onPress: async () => {
          try {
            if (requestId.startsWith('leave-')) {
              const id = Number(requestId.replace('leave-', ''));
              await managerService.reviewLeave(id, 'reject', 'Ditolak');
            } else {
              const id = Number(requestId.replace('reimburse-', ''));
              await managerService.reviewReimbursement(id, 'rejected', 'Ditolak');
            }

            await fetchRequests();
            setSelectedRequestId(null);
            Alert.alert('Berhasil', 'Request telah ditolak');
          } catch (error) {
            Alert.alert('Error', 'Gagal menolak request');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return ValuateColors.success;
      case 'Pending':
        return ValuateColors.warning;
      case 'Rejected':
        return ValuateColors.error;
      default:
        return ValuateColors.text.secondary;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    return type === 'Reimburse' ? 'banknote.fill' : 'calendar.badge.minus';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRequestDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatRange = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    return `${formatRequestDate(start)} sampai ${formatRequestDate(end)}`;
  };

  const renderRequestItem = ({ item }: { item: StaffRequest }) => {
    const isSelected = selectedRequestId === item.id;
    
    return (
      <TouchableOpacity 
        style={[styles.requestItem, isSelected && styles.requestItemExpanded]}
        onPress={() => setSelectedRequestId(isSelected ? null : item.id)}
      >
        <View style={styles.requestItemHeader}>
          <View style={[styles.requestTypeIcon, { backgroundColor: item.type === 'Reimburse' ? '#6366F1' : '#F59E0B' }]}>
            <IconSymbol 
              name={getRequestTypeIcon(item.type)} 
              size={20} 
              color="white" 
            />
          </View>
          
          <View style={styles.requestInfo}>
            <Text style={styles.staffName}>{item.staffName}</Text>
            <Text style={styles.requestTitle}>{item.title}</Text>
            <Text style={styles.staffID}>{item.staffID}</Text>
          </View>
          
          <View style={styles.requestRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {isSelected && (
          <View style={styles.requestDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipe Request:</Text>
              <Text style={styles.detailValue}>{item.type}</Text>
            </View>
            
            {item.amount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Jumlah:</Text>
                <Text style={styles.detailValue}>{formatCurrency(item.amount)}</Text>
              </View>
            )}

            {item.startDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tanggal:</Text>
                <Text style={styles.detailValue}>
                  {formatRange(item.startDate, item.endDate)}
                </Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Alasan:</Text>
              <Text style={styles.detailValue}>{item.reason}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal Request:</Text>
              <Text style={styles.detailValue}>{formatRequestDate(item.requestDate)}</Text>
            </View>

            {item.status === 'Pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(item.id)}
                >
                  <IconSymbol name="xmark" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Tolak</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(item.id)}
                >
                  <IconSymbol name="checkmark" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Setujui</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (authLoading || !isAuthenticated) return null;

  if (!isManager) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={ValuateColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Staff</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyState}>
          <IconSymbol name="lock.fill" size={48} color={ValuateColors.text.light} />
          <Text style={styles.emptyStateText}>Menu ini hanya untuk manager</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={ValuateColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Staff</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterButtonsContainer}>
        {(['Pending', 'Approved', 'Rejected', 'All'] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ValuateColors.primary} />
        </View>
      ) : filteredRequests.length > 0 ? (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyState}>
          <IconSymbol name="doc.text.magnifyingglass" size={48} color={ValuateColors.text.light} />
          <Text style={styles.emptyStateText}>Belum ada request {selectedFilter.toLowerCase()}</Text>
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
  filterButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ValuateColors.text.light + '30',
  },
  filterButtonActive: {
    backgroundColor: ValuateColors.primary,
    borderColor: ValuateColors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: ValuateColors.text.secondary,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  requestItem: {
    backgroundColor: ValuateColors.cardBackground,
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  requestItemExpanded: {
    // Expanded state styling is handled by detailsRevealed
  },
  requestItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  requestTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: ValuateColors.text.primary,
  },
  requestTitle: {
    fontSize: 13,
    color: ValuateColors.text.secondary,
    marginTop: 4,
  },
  staffID: {
    fontSize: 11,
    color: ValuateColors.text.light,
    marginTop: 2,
  },
  requestRight: {
    alignItems: 'flex-end',
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
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: ValuateColors.text.light + '20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ValuateColors.navBackground + '50',
  },
  detailRow: {
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: ValuateColors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: ValuateColors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: ValuateColors.success,
  },
  rejectButton: {
    backgroundColor: ValuateColors.error,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
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

export default withProtectedRoute(RequestScreen, 'RequestScreen');
