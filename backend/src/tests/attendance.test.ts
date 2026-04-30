import request from 'supertest';
import express, { Application } from 'express';

// Apply mocks before importing routes/controllers
jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 1, role: 'user' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('../services/attendanceService', () => ({
  verifyQrSignature: jest.fn(),
}));

jest.mock('../models/attendances', () => ({
  Attendance: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

import attendanceRoutes from '../routes/attendanceRoutes';
import { verifyQrSignature } from '../services/attendanceService';
import { Attendance } from '../models/attendances';

const app: Application = express();
app.use(express.json());
app.use('/api/attendance', attendanceRoutes);

describe('Attendance scanQR', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('scan QR - clock in successful', async () => {
    (verifyQrSignature as jest.Mock).mockReturnValue(true);
    (Attendance as any).findOne.mockResolvedValue(null);
    const created = {
      id: 1,
      userId: 1,
      date: new Date().toISOString().slice(0, 10),
      clockIn: '09:00:00',
      clockOut: '00:00:00',
    };
    (Attendance as any).create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/attendance/scan')
      .send({ qr: { signature: 'good' } });
    expect(res.status).toBe(200);
    expect(res.body.action).toBe('clockIn');
    expect(res.body.record).toBeDefined();
    expect(
      (verifyQrSignature as jest.Mock).mock.calls.length,
    ).toBeGreaterThanOrEqual(1);
    expect((Attendance as any).create).toHaveBeenCalledTimes(1);
  });

  it('scan QR - clock in failed (invalid signature)', async () => {
    (verifyQrSignature as jest.Mock).mockReturnValue(false);
    const res = await request(app)
      .post('/api/attendance/scan')
      .send({ qr: { signature: 'bad' } });
    expect(res.status).toBe(400);
    expect(res.body.valid).toBeFalsy();
  });

  it('scan QR - clock out successful', async () => {
    (verifyQrSignature as jest.Mock).mockReturnValue(true);
    const recordMock: any = {
      id: 2,
      userId: 1,
      date: new Date().toISOString().slice(0, 10),
      clockIn: '09:00:00',
      clockOut: '00:00:00',
      save: jest.fn().mockResolvedValue(true),
    };
    (Attendance as any).findOne.mockResolvedValue(recordMock);

    const res = await request(app)
      .post('/api/attendance/scan')
      .send({ qr: { signature: 'good' } });
    expect(res.status).toBe(200);
    expect(res.body.action).toBe('clockOut');
    expect(
      (recordMock.save as jest.Mock).mock.calls.length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('scan QR - clock out failed (already clocked out)', async () => {
    (verifyQrSignature as jest.Mock).mockReturnValue(true);
    const recordMock: any = {
      id: 3,
      userId: 1,
      date: new Date().toISOString().slice(0, 10),
      clockIn: '09:00:00',
      clockOut: '17:00:00',
      save: jest.fn().mockResolvedValue(true),
    };
    (Attendance as any).findOne.mockResolvedValue(recordMock);

    const res = await request(app)
      .post('/api/attendance/scan')
      .send({ qr: { signature: 'good' } });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Already clocked in and out today');
  });

  it('update attendance (admin) - success', async () => {
    const recordMock: any = {
      id: 5,
      userId: 2,
      clockIn: '09:00:00',
      clockOut: '00:00:00',
      status: 'absent',
      notes: null,
      save: jest.fn().mockResolvedValue(true),
    };
    (Attendance as any).findOne.mockResolvedValue(recordMock);

    const res = await request(app)
      .put('/api/attendance/5')
      .send({ status: 'present', clockIn: '08:45:00', notes: 'adjusted' });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(5);
    expect(res.body.status).toBe('present');
  });
});
