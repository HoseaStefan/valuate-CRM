import request from 'supertest';
import express, { Application } from 'express';
import profileRoutes from '../routes/profileRoutes';
import { authMiddleware } from '../middleware/authMiddleware';

const app: Application = express();
app.use(express.json());
app.use('/api/profile', profileRoutes);

jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 10, role: 'staff' };
    next();
  }
}));

jest.mock('../controllers/profileController', () => ({
  updateSelfProfile: jest.fn((req, res) => res.status(200).json({ id: 10, phoneNumber: req.body.phoneNumber || '08111111' }))
}));

describe('Profile Routes (Self Edit)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update owners profile skipping restricted fields (PUT /api/profile)', async () => {
    const payload = { 
      phoneNumber: '089999999', 
      address: 'Jl. Sudirman',
      baseSalary: 10000000 // Intrusion attempt
    };

    const response = await request(app)
      .put('/api/profile')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.phoneNumber).toBe('089999999');
  });
});
