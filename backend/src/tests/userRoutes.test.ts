import request from 'supertest';
import express, { Application } from 'express';
import userRoutes from '../routes/userRoutes';
import { authMiddleware } from '../middleware/authMiddleware';
import * as userController from '../controllers/userController';

// Setup Express
const app: Application = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Mock middlewares and controllers
jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 999, role: 'admin' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next()
}));

jest.mock('../controllers/userController', () => ({
  createUser: jest.fn((req, res) => res.status(201).json({ id: 1, email: req.body.email, fullName: req.body.fullName })),
  getUsers: jest.fn((req, res) => res.status(200).json([{ id: 1, email: 'test@example.com', fullName: 'Test Name' }])),
  getUserById: jest.fn((req, res) => res.status(200).json({ id: parseInt(req.params.id), email: 'test@example.com' })),
  updateUser: jest.fn((req, res) => res.status(200).json({ id: parseInt(req.params.id), fullName: req.body.fullName || 'Updated Name' })),
  deleteUser: jest.fn((req, res) => res.status(200).json({ message: 'User deleted successfully' })),
}));

describe('User Routes with new Sequelize synced schema', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const payload = { 
    email: 'new@example.com', 
    fullName: 'New User', 
    password: 'password123',
    phoneNumber: '0812345678',
    address: 'Jl. Merdeka',
    role: 'staff',
    baseSalary: 5000000
  };

  it('should create a new user (POST /api/users)', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('email', 'new@example.com');
  });

  it('should get all users (GET /api/users)', async () => {
    const response = await request(app).get('/api/users');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].fullName).toBe('Test Name');
  });

  it('should get user by integer ID (GET /api/users/:id)', async () => {
    const response = await request(app).get('/api/users/1');
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
  });

  it('should update user fields (PUT /api/users/:id)', async () => {
    const response = await request(app)
      .put('/api/users/1')
      .send({ fullName: 'Updated Name' });
    
    expect(response.status).toBe(200);
    expect(response.body.fullName).toBe('Updated Name');
  });

  it('should delete a user (DELETE /api/users/:id)', async () => {
    const response = await request(app).delete('/api/users/1');
    expect(response.status).toBe(200);
  });
});
