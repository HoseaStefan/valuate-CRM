import { buildUrl, fetchJson } from './apiClient';

export type LeaveStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type LeaveItem = {
  id: string;
  title: string;
  subtitle: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  status: LeaveStatus;
};

type LeaveApiStatus = 'pending' | 'approved' | 'rejected';

type LeaveApiItem = {
  id: number;
  reason: 'vacation' | 'sick leave' | 'personal leave' | 'other';
  startDate: string;
  endDate: string;
  status: LeaveApiStatus;
  createdAt?: string;
  user?: {
    id: number;
    fullName?: string;
  };
};

const mapStatus = (status: LeaveApiStatus): LeaveStatus => {
  switch (status) {
    case 'approved':
      return 'Disetujui';
    case 'rejected':
      return 'Ditolak';
    default:
      return 'Menunggu';
  }
};

const mapReason = (reason: LeaveApiItem['reason']): string => {
  switch (reason) {
    case 'vacation':
      return 'Cuti Tahunan';
    case 'sick leave':
      return 'Cuti Sakit';
    case 'personal leave':
      return 'Izin Pribadi';
    default:
      return 'Cuti Lainnya';
  }
};

export const leaveService = {
  async getHistory(params?: { month?: number; year?: number; limit?: number }): Promise<LeaveItem[]> {
    const response = await fetchJson<LeaveApiItem[] | { data: LeaveApiItem[] }>(
      buildUrl('/leave/history', params),
    );
    const items = Array.isArray(response) ? response : response?.data || [];

    return items.map((item: LeaveApiItem) => ({
      id: String(item.id),
      title: 'Pengajuan Cuti',
      subtitle: mapReason(item.reason),
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate),
      createdAt: new Date(item.createdAt || item.startDate),
      status: mapStatus(item.status),
    }));
  },

  async getRecent(): Promise<LeaveItem[]> {
    const response = await fetchJson<LeaveApiItem[] | { data: LeaveApiItem[] }>(
      '/leave/recent',
    );
    const items = Array.isArray(response) ? response : response?.data || [];

    return items.map((item: LeaveApiItem) => ({
      id: String(item.id),
      title: 'Pengajuan Cuti',
      subtitle: mapReason(item.reason),
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate),
      createdAt: new Date(item.createdAt || item.startDate),
      status: mapStatus(item.status),
    }));
  },

  async createLeave(payload: { reason: LeaveApiItem['reason']; startDate: string; days?: number; endDate?: string }) {
    return fetchJson('/leave', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCalendar(params: { month: number; year: number; all?: boolean }) {
    return fetchJson<{ data: LeaveApiItem[] }>(buildUrl('/leave/calendar', params));
  },
};
