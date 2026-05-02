import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/sequelize';

dotenv.config();

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import profileRoutes from './routes/profileRoutes';
import leaveRoutes from './routes/leaveRoutes';
import reimbursementRoutes from './routes/reimbursementRoutes';
import payrollRoutes from './routes/payrollRoutes';
import attendanceRoutes from './routes/attendanceRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // spesifik, bukan '*'
  credentials: true,               // izinkan credentials
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/reimbursement', reimbursementRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Express Sequelize API' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize Database and Start Server
const startServer = async () => {
  try {
    // Test connection (don't sync - we use migrations)
    await sequelize.authenticate();
    console.log('Database connection verified');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
