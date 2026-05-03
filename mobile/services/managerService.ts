import { buildUrl, fetchJson } from './apiClient';

export type ManagerStatus = {
  isManager: boolean;
  subordinateCount: number;
};

export type LeaveRequestApiItem = {
  id: number;
  reason: 'vacation' | 'sick leave' | 'personal leave' | 'other';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  user?: {
    id: number;
    fullName?: string;
  };
};

export type ReimbursementRequestApiItem = {
  id: number;
  title: string;
  description?: string | null;
  amount: string | number;
  proofPath?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user?: {
    id: number;
    fullName?: string;
  };
};

export const managerService = {
  async getManagerStatus() {
    return fetchJson<ManagerStatus>('/profile/manager-status');
  },

  async getLeaveRequests(params?: { status?: 'pending' | 'approved' | 'rejected' }) {
    return fetchJson<LeaveRequestApiItem[]>(buildUrl('/leave/requests', params));
  },

  async reviewLeave(id: number, action: 'approve' | 'reject', rejectionReason?: string) {
    return fetchJson(`/leave/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, rejectionReason }),
    });
  },

  async getReimbursementRequests(params?: { status?: 'pending' | 'approved' | 'rejected' }) {
    return fetchJson<ReimbursementRequestApiItem[]>(buildUrl('/reimbursement/requests', params));
  },

  async reviewReimbursement(id: number, status: 'approved' | 'rejected', rejectionReason?: string) {
    return fetchJson(`/reimbursement/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason }),
    });
  },
};
