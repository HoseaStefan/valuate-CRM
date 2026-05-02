import { buildUrl, fetchJson } from './apiClient';

export type ReimburseStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type ReimburseItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  submittedAt: Date;
  status: ReimburseStatus;
};

type ReimburseApiStatus = 'pending' | 'approved' | 'rejected';

type ReimburseApiItem = {
  id: number;
  title: string;
  description?: string | null;
  amount: string | number;
  status: ReimburseApiStatus;
  createdAt: string;
};

const mapStatus = (status: ReimburseApiStatus): ReimburseStatus => {
  switch (status) {
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    default:
      return 'Menunggu';
  }
};

const parseAmount = (amount: string | number): number => {
  if (typeof amount === 'number') return amount;
  const parsed = Number(amount);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const reimbursementService = {
  async getHistory(params?: { status?: ReimburseApiStatus; limit?: number }) {
    const response = await fetchJson<ReimburseApiItem[] | { data: ReimburseApiItem[] }>(
      buildUrl('/reimbursement/history', params),
    );
    const items = Array.isArray(response) ? response : response?.data || [];

    return items.map((item: ReimburseApiItem): ReimburseItem => ({
      id: String(item.id),
      title: item.title,
      subtitle: item.description || 'Reimbursement',
      amount: parseAmount(item.amount),
      submittedAt: new Date(item.createdAt),
      status: mapStatus(item.status),
    }));
  },

  async getRecent(): Promise<ReimburseItem[]> {
    const response = await fetchJson<ReimburseApiItem[] | { data: ReimburseApiItem[] }>(
      '/reimbursement/recent',
    );
    const items = Array.isArray(response) ? response : response?.data || [];

    return items.map((item: ReimburseApiItem): ReimburseItem => ({
      id: String(item.id),
      title: item.title,
      subtitle: item.description || 'Reimbursement',
      amount: parseAmount(item.amount),
      submittedAt: new Date(item.createdAt),
      status: mapStatus(item.status),
    }));
  },

  async createReimbursement(formData: FormData) {
    return fetchJson('/reimbursement', {
      method: 'POST',
      body: formData,
    });
  },
};
