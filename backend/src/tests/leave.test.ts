import request from 'supertest';
import express, { Application } from 'express';
import leaveRoutes from '../routes/leaveRoutes';

const app: Application = express();
app.use(express.json());
app.use('/api/leave', leaveRoutes);

jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('../controllers/leaveController', () => ({
  requestLeave: jest.fn((req, res) =>
    res
      .status(201)
      .json({ id: 10, userId: req.user.id, reason: req.body.reason }),
  ),
  leaveApproval: jest.fn((req, res) => {
    if (
      req.body.action === 'reject' &&
      (!req.body.rejectionReason || req.body.rejectionReason.trim() === '')
    ) {
      return res
        .status(400)
        .json({ message: 'Rejection reason strictly required' });
    }
    return res.status(200).json({
      id: parseInt(req.params.id),
      status: req.body.action === 'approve' ? 'approved' : 'rejected',
    });
  }),
  calendarView: jest.fn((req, res) =>
    res.status(200).json([{ id: 1, userId: req.user.id }]),
  ),
  editRequestLeave: jest.fn((req, res) =>
    res.status(200).json({
      id: parseInt(req.params.id),
      reason: req.body.reason || 'edited',
    }),
  ),
}));

describe('Leave Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a leave request (POST /api/leave)', async () => {
    const res = await request(app).post('/api/leave').send({
      reason: 'vacation',
      startDate: new Date().toISOString(),
      days: 2,
    });
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(1);
  });

  it('rejects approval without rejection reason (PUT /api/leave/:id/review)', async () => {
    const res = await request(app)
      .put('/api/leave/10/review')
      .send({ action: 'reject', rejectionReason: ' ' });
    expect(res.status).toBe(400);
  });

  it('approves a leave request properly (PUT /api/leave/:id/review)', async () => {
    const res = await request(app)
      .put('/api/leave/11/review')
      .send({ action: 'approve' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  it('fetches calendar view (GET /api/leave/calendar)', async () => {
    const res = await request(app).get('/api/leave/calendar');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('allows admin to edit leave request (PUT /api/leave/:id)', async () => {
    const res = await request(app)
      .put('/api/leave/5')
      .send({ reason: 'sick leave' });
    expect(res.status).toBe(200);
    expect(res.body.reason).toBe('sick leave');
  });
});
