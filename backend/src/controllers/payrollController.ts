import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Payroll } from '../entities/Payroll';
import { PayrollAdjustment } from '../entities/PayrollAdjustment';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/authMiddleware';

const payrollRepository = AppDataSource.getRepository(Payroll);
const adjustmentRepository = AppDataSource.getRepository(PayrollAdjustment);
const userRepository = AppDataSource.getRepository(User);

export const addManualAdjustment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId, title, type, amount, description } = req.body;
    const adminId = req.user?.id;

    if (
      !userId ||
      !title ||
      !type ||
      typeof amount !== 'number' ||
      Math.abs(amount) <= 0
    ) {
      res.status(400).json({
        message:
          'Missing required manual payroll adjustment fields or invalid mathematical amount',
      });
      return;
    }

    if (
      !['bonus', 'deduction', 'damage', 'lateFine', 'others'].includes(type)
    ) {
      res
        .status(400)
        .json({ message: 'Invalid manual adjustment type definition' });
      return;
    }

    const employee = await userRepository.findOne({ where: { id: userId } });
    if (!employee) {
      res
        .status(404)
        .json({ message: 'Target employee for salary adjustment not found' });
      return;
    }

    // Manual inputs authored by Admin bypass standard queued approvals
    const newAdjustment = adjustmentRepository.create({
      userId,
      title,
      type,
      amount: Math.abs(amount),
      description: description || null,
      status: 'approved',
      reviewedById: adminId,
    });

    await adjustmentRepository.save(newAdjustment);
    res.status(201).json(newAdjustment);
  } catch (error) {
    console.error('Error adding manual adjustment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const calculateMonthlyPayroll = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { month, year } = req.body;

    if (!month || typeof year !== 'number') {
      res.status(400).json({
        message:
          'Month (String) and Year (Int) generation parameters strictly required',
      });
      return;
    }

    const allEmployees = await userRepository.find();
    const payrollsCalculated: Payroll[] = [];

    // FR-PAY-03 Total Formula Requirements
    for (const employee of allEmployees) {
      const adjustments = await adjustmentRepository.find({
        where: { userId: employee.id, status: 'approved' },
      });

      const currentPeriodAdjustments = adjustments.filter((adj) => {
        const d = new Date(adj.createdAt);
        return d.getFullYear() === year;
      });

      let additions = 0;
      let deductions = 0;

      for (const adj of currentPeriodAdjustments) {
        if (['bonus', 'reimbursement', 'others'].includes(adj.type)) {
          additions += Number(adj.amount);
        } else if (['deduction', 'damage', 'lateFine'].includes(adj.type)) {
          deductions += Number(adj.amount);
        }
      }

      const totalAdjustments = additions - deductions;
      const baseSalaryNumerical = Number(employee.baseSalary);
      const netSalary = baseSalaryNumerical + totalAdjustments;

      let payrollRecord = await payrollRepository.findOne({
        where: { userId: employee.id, month, year },
      });

      if (!payrollRecord) {
        payrollRecord = payrollRepository.create({
          userId: employee.id,
          month,
          year,
          baseSalary: baseSalaryNumerical,
          totalAdjustments,
          netSalary,
          status: 'pending',
        });
      } else {
        payrollRecord.baseSalary = baseSalaryNumerical;
        payrollRecord.totalAdjustments = totalAdjustments;
        payrollRecord.netSalary = netSalary;
      }

      await payrollRepository.save(payrollRecord);
      payrollsCalculated.push(payrollRecord);
    }

    res.status(200).json(payrollsCalculated);
  } catch (error) {
    console.error('CRITICAL Error calculating payroll automated:', error);
    res.status(500).json({
      message:
        'Internal server error while resolving global corporate calculations',
    });
  }
};

export const getSalarySlip = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { month, year } = req.params;
    const userId = req.user?.id;

    const slip = await payrollRepository.findOne({
      where: { userId, month, year: parseInt(year, 10) },
      relations: ['user'],
    });

    if (!slip) {
      res.status(404).json({
        message:
          'Salary slip generation failed: Not found for requested employee cycle parameters',
      });
      return;
    }

    // Sanitize returned structure for frontend parsing directly mapping the components
    const sanitizedUser = { ...slip.user };
    delete (sanitizedUser as any).password;

    slip.user = sanitizedUser as User;

    res.status(200).json(slip);
  } catch (error) {
    console.error('Error securely generating salary slip:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePayrollStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid payroll ID' });
      return;
    }

    if (!['paid', 'failed'].includes(status)) {
      res.status(400).json({ message: 'Status must be paid, or failed' });
      return;
    }

    const payrollRecord = await payrollRepository.findOne({ where: { id } });
    if (!payrollRecord) {
      res.status(404).json({ message: 'Payroll record not found' });
      return;
    }

    payrollRecord.status = status;

    if (status === 'paid') {
      payrollRecord.paymentDate = new Date();
    }

    await payrollRepository.save(payrollRecord);
    res.status(200).json(payrollRecord);
  } catch (error) {
    console.error('Error updating payroll status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
