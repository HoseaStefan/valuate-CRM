import { buildUrl, fetchJson } from './apiClient';

export type PayrollStatus = 'Processed' | 'Pending' | 'Error';

export type PayrollItem = {
  id: string;
  month: string;
  monthNumber: number;
  year: number;
  salary: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
};

type PayrollApiStatus = 'pending' | 'paid' | 'failed';

type PayrollApiItem = {
  id: number;
  month: string;
  year: number;
  baseSalary: string | number;
  totalAdjustments: string | number;
  netSalary: string | number;
  status: PayrollApiStatus;
};

const MONTH_INDEX: Record<string, number> = {
  Januari: 1,
  Februari: 2,
  Maret: 3,
  April: 4,
  Mei: 5,
  Juni: 6,
  Juli: 7,
  Agustus: 8,
  September: 9,
  Oktober: 10,
  November: 11,
  Desember: 12,
};

const mapStatus = (status: PayrollApiStatus): PayrollStatus => {
  switch (status) {
    case 'paid':
      return 'Processed';
    case 'failed':
      return 'Error';
    default:
      return 'Pending';
  }
};

const parseAmount = (amount: string | number): number => {
  if (typeof amount === 'number') return amount;
  const parsed = Number(amount);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const monthNumber = (month: string): number => {
  const normalized = month.trim();
  if (MONTH_INDEX[normalized]) return MONTH_INDEX[normalized];
  const asNumber = Number(month);
  return Number.isNaN(asNumber) ? 0 : asNumber;
};

export const payrollService = {
  async getHistory(year?: number): Promise<PayrollItem[]> {
    const response = await fetchJson<PayrollApiItem[] | { data: PayrollApiItem[] }>(
      buildUrl('/payroll/history', { year }),
    );
    const items = Array.isArray(response) ? response : response?.data || [];

    return items.map((item: PayrollApiItem): PayrollItem => {
      const baseSalary = parseAmount(item.baseSalary);
      const totalAdjustments = parseAmount(item.totalAdjustments);

      return {
        id: String(item.id),
        month: item.month,
        monthNumber: monthNumber(item.month),
        year: item.year,
        salary: baseSalary,
        deductions: Math.max(0, -totalAdjustments),
        netSalary: parseAmount(item.netSalary),
        status: mapStatus(item.status),
      };
    });
  },

  async getSlip(month: string, year: number) {
    return fetchJson(`/payroll/slip/${month}/${year}`);
  },
};
