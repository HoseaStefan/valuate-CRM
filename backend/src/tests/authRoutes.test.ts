import request from 'supertest';
import express, { Application } from 'express';
import authRoutes from '../routes/authRoutes';

// Setup Express
const app: Application = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock middlewares and controller
jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 1, role: 'admin' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('../controllers/authController', () => ({
  login: jest.fn((req, res) =>
    res.status(200).json({ message: 'Login successful', token: 'tok123', user: { id: 1, email: req.body.username } }),
  ),
  resetPassword: jest.fn((req, res) =>
    res.status(200).json({ message: 'Password has been reset to default' }),
  ),
  changePassword: jest.fn((req, res) =>
    res.status(200).json({ message: 'Password changed successfully' }),
  ),
}));

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/login should return token and user', async () => {
    const response = await request(app).post('/api/auth/login').send({ username: 'test@example.com', password: 'pwd' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token', 'tok123');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('POST /api/auth/reset-password should allow admin to reset', async () => {
    const response = await request(app).post('/api/auth/reset-password').send({ username: 'someone@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Password has been reset to default');
  });

  it('POST /api/auth/change-password should allow authenticated user to change password', async () => {
    const payload = { currentPassword: 'old', newPassword: 'newpassword123' };
    const response = await request(app).post('/api/auth/change-password').send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Password changed successfully');
  });
});
