import { buildUrl, fetchJson } from './apiClient';

export type AttendanceStatus = 'Hadir' | 'Telat' | 'Izin' | 'Sakit' | 'Libur';

export type AttendanceItem = {
  id: string;
  date: Date;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
};

type AttendanceApiStatus = 'present' | 'absent' | 'late' | 'excused';

type AttendanceApiItem = {
  id: number;
  date: string;
  status: AttendanceApiStatus;
  clockIn: string;
  clockOut: string;
};

const mapStatus = (status: AttendanceApiStatus): AttendanceStatus => {
  switch (status) {
    case 'present':
      return 'Hadir';
    case 'late':
      return 'Telat';
    case 'excused':
      return 'Izin';
    case 'absent':
      return 'Libur';
    default:
      return 'Libur';
  }
};

export const attendanceService = {
  async getHistory(month: number, year: number): Promise<AttendanceItem[]> {
    const response = await fetchJson<{ data: AttendanceApiItem[] }>(
      buildUrl('/attendance/history', { month, year }),
    );

    const items = Array.isArray(response?.data) ? response.data : [];

    return items.map((item: AttendanceApiItem) => ({
      id: String(item.id),
      date: new Date(item.date),
      status: mapStatus(item.status),
      checkIn: item.clockIn,
      checkOut: item.clockOut,
    }));
  },

  async scanQr(qrPayload: string) {
    return fetchJson<{ valid: boolean; action?: 'clockIn' | 'clockOut'; message?: string }>(
      '/attendance/scan',
      {
        method: 'POST',
        body: JSON.stringify({ qr: qrPayload }),
      },
    );
  },

  async getTodayStatus() {
    return fetchJson<{
      hasRecord: boolean;
      hasClockOut?: boolean;
      record?: { clockIn?: string; clockOut?: string };
    }>('/attendance/today-status');
  },
};
