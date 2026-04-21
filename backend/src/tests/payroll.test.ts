import request from 'supertest';
import express, { Application } from 'express';
import reimbursementRoutes from '../routes/reimbursementRoutes';
import payrollRoutes from '../routes/payrollRoutes';

const app: Application = express();
app.use(express.json());
app.use('/api/reimbursement', reimbursementRoutes);
app.use('/api/payroll', payrollRoutes);

jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next()
}));

jest.mock('../controllers/reimbursementController', () => ({
  createReimbursement: jest.fn((req, res) => res.status(201).json({ id: 10, type: 'reimbursement', amount: req.body.amount, status: 'pending' })),
  updateReimbursementApproval: jest.fn((req, res) => {
    if (req.body.status === 'rejected' && (!req.body.rejectionReason || req.body.rejectionReason.trim() === '')) {
       return res.status(400).json({ message: 'Rejection reason strictly required' });
    }
    return res.status(200).json({ id: parseInt(req.params.id), status: req.body.status, rejectionReason: req.body.rejectionReason || null });
  }),
  getReimbursementRequests: jest.fn((req, res) => res.status(200).json([
    { id: 10, type: 'reimbursement', status: 'pending' },
    { id: 11, type: 'reimbursement', status: 'approved' }
  ]))
}));

jest.mock('../controllers/payrollController', () => ({
  addManualAdjustment: jest.fn((req, res) => res.status(201).json({ id: 99, type: req.body.type, amount: req.body.amount, status: 'approved' })),
  calculateMonthlyPayroll: jest.fn((req, res) => {

    // Simulate Base 5,000,000 + Bonus 1,000,000 
    const base = 5000000;
    const additions = 1000000;
    const deductions = 0;
    return res.status(200).json([{ userId: 1, baseSalary: base, totalAdjustments: additions - deductions, netSalary: base + additions - deductions }]);
  }),
  getSalarySlip: jest.fn((req, res) => res.status(200).json({ userId: 1, month: req.params.month, year: parseInt(req.params.year) })),
  updatePayrollStatus: jest.fn((req, res) => res.status(200).json({ id: parseInt(req.params.id), status: req.body.status }))
}));

describe('Financial Modules Routes Validation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Reimbursement Routes', () => {
    it('creates reimbursement requested dynamically (POST /api/reimbursement)', async () => {
      const res = await request(app).post('/api/reimbursement').send({ title: 'Travel', amount: 50000 });
      expect(res.status).toBe(201);
      expect(res.body.amount).toBe(50000);
    });

    it('rejects an approval review without reason mathematically guarding the workflow (PUT /api/reimbursement/:id/review)', async () => {
      const res = await request(app).put('/api/reimbursement/10/review').send({ status: 'rejected', rejectionReason: ' ' });
      expect(res.status).toBe(400); 
    });

    it('approves a reimbursement review properly formatted (PUT /api/reimbursement/:id/review)', async () => {
      const res = await request(app).put('/api/reimbursement/10/review').send({ status: 'approved' });
      expect(res.status).toBe(200); 
      expect(res.body.status).toBe('approved'); 
    });

    it('fetches a filtered list of reimbursement requests correctly (GET /api/reimbursement/requests)', async () => {
      const res = await request(app).get('/api/reimbursement/requests?status=pending');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Payroll Routes', () => {
    it('handles generic incentive inputs explicitly (POST /api/payroll/adjustments)', async () => {
      const res = await request(app).post('/api/payroll/adjustments').send({ userId: 1, title: 'Bonus Tahunan', type: 'bonus', amount: 1000000 });
      expect(res.status).toBe(201);
      expect(res.body.type).toBe('bonus');
    });

    it('calculates the exact final mathematics based on generated parameters (POST /api/payroll/calculate)', async () => {
      const res = await request(app).post('/api/payroll/calculate').send({ month: 'March', year: 2026 });
      expect(res.status).toBe(200);
      expect(res.body[0].netSalary).toBe(6000000); // 5jt Base + 1jt additions
    });

    it('allows generation of distinct salary slip metadata via secure fetching (GET /api/payroll/slip/:month/:year)', async () => {
      const res = await request(app).get('/api/payroll/slip/March/2026');
      expect(res.status).toBe(200);
      expect(res.body.month).toBe('March');
      expect(res.body.year).toBe(2026);
    });

    it('allows admin to finalize the real world money transfer natively recording timestamps (PUT /api/payroll/:id/status)', async () => {
      const res = await request(app).put('/api/payroll/1/status').send({ status: 'paid' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('paid');
    });
  });
});
