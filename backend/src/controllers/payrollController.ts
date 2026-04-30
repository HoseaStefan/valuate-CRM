import { Response } from 'express';
import { Payroll } from '../models/payroll';
import { PayrollAdjustment } from '../models/payrollAdjustment';
import { User } from '../models/users';
import { AuthRequest } from '../middleware/authMiddleware';

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
      !['bonus', 'deduction', 'damage', 'lateFine', 'reimbursement', 'others'].includes(type)
    ) {
      res
        .status(400)
        .json({ message: 'Invalid manual adjustment type definition' });
      return;
    }

    const employee = await User.findOne({ where: { id: userId } });
    if (!employee) {
      res
        .status(404)
        .json({ message: 'Target employee for salary adjustment not found' });
      return;
    }

    // Manual inputs authored by Admin bypass standard queued approvals
    const newAdjustment = await PayrollAdjustment.create({
      userId,
      title,
      type,
      amount: Math.abs(amount),
      description: description || null,
      status: 'approved',
      reviewedById: adminId,
    });

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

    const allEmployees = await User.findAll();
    const payrollsCalculated: any[] = [];

    // FR-PAY-03 Total Formula Requirements
    for (const employee of allEmployees) {
      const adjustments = await PayrollAdjustment.findAll({
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

      const totalAdjustmentsAmount = additions - deductions;
      const baseSalaryNumerical = Number(employee.baseSalary);
      const netSalary = baseSalaryNumerical + totalAdjustmentsAmount;

      let payrollRecord = await Payroll.findOne({
        where: { userId: employee.id, month, year },
      });

      if (!payrollRecord) {
        payrollRecord = await Payroll.create({
          userId: employee.id,
          month,
          year,
          baseSalary: baseSalaryNumerical,
          totalAdjustments: totalAdjustmentsAmount,
          netSalary: netSalary,
          status: 'pending',
        });
      } else {
        payrollRecord.baseSalary = baseSalaryNumerical.toString();
        payrollRecord.totalAdjustments = totalAdjustmentsAmount.toString();
        payrollRecord.netSalary = netSalary.toString();
        await payrollRecord.save();
      }

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

    const slip = await Payroll.findOne({
      where: { userId, month, year: parseInt(year, 10) },
      include: [{ model: User, as: 'user' }],
    });

    if (!slip) {
      res.status(404).json({
        message:
          'Salary slip generation failed: Not found for requested employee cycle parameters',
      });
      return;
    }

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
      res.status(400).json({ message: 'Status must be paid or failed' });
      return;
    }

    const payrollRecord = await Payroll.findOne({ where: { id } });
    if (!payrollRecord) {
      res.status(404).json({ message: 'Payroll record not found' });
      return;
    }

    payrollRecord.status = status;

    if (status === 'paid') {
      payrollRecord.paymentDate = new Date();
    }

    await payrollRecord.save();
    res.status(200).json(payrollRecord);
  } catch (error) {
    console.error('Error updating payroll status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
