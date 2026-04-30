import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

// Import all models
import { User } from '../models/users';
import { Attendance } from '../models/attendances';
import { LeaveRequest } from '../models/leaveRequest';
import { Payroll } from '../models/payroll';
import { PayrollAdjustment } from '../models/payrollAdjustment';

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.DB_DATABASE || 'tubes_rpll',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  models: [User, Attendance, LeaveRequest, Payroll, PayrollAdjustment],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
