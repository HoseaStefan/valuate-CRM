import { Response } from 'express';
import { Op } from 'sequelize';
import { PayrollAdjustment } from '../models/payrollAdjustment';
import { User } from '../models/users';
import { AuthRequest } from '../middleware/authMiddleware';

export const createReimbursement = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, amount, description } = req.body;

    // Validate inputs
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (!title || typeof amountNum !== 'number' || isNaN(amountNum) || Math.abs(amountNum) <= 0) {
      res.status(400).json({
        message: 'Title and a valid positive mathematical amount are required',
      });
      return;
    }

    // Check Proof Path from uploaded file
    if (!req.file) {
      res.status(400).json({ message: 'Proof file is required' });
      return;
    }
    
    const proofPath = `/uploads/reimbursements/${req.file.filename}`;

    const newReimbursement = await PayrollAdjustment.create({
      userId,
      title,
      type: 'reimbursement',
      amount: Math.abs(amountNum),
      description: description || null,
      proofPath: proofPath,
      status: 'pending',
    });

    res.status(201).json(newReimbursement);
  } catch (error) {
    console.error('Error creating reimbursement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateReimbursementApproval = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const reviewerId = req.user?.id;
    const reviewerRole = req.user?.role;
    const id = parseInt(req.params.id, 10);
    const { status, rejectionReason } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid reimbursement ID' });
      return;
    }

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        message: 'Status must be tightly set to either approved or rejected',
      });
      return;
    }

    // Rejection Logic
    if (
      status === 'rejected' &&
      (!rejectionReason || String(rejectionReason).trim() === '')
    ) {
      res.status(400).json({
        message:
          'Rejection reason is strictly required when declining a reimbursement request',
      });
      return;
    }

    const reimbursement = await PayrollAdjustment.findOne({
      where: { id, type: 'reimbursement' },
      include: [{ model: User, as: 'user' }],
    });

    if (!reimbursement) {
      res.status(404).json({
        message: 'Reimbursement request not found in database records',
      });
      return;
    }

    if (reimbursement.userId === reviewerId) {
      res.status(403).json({
        message:
          'Forbidden: Security mechanism preventing users from approving or rejecting their own personal reimbursement requests',
      });
      return;
    }

    // Role Hierarchy Authorization
    if (reviewerRole !== 'admin') {
      let isSuperior = false;
      let currentCheckUserId = (reimbursement as any).user.managerId;

      // Check if reviewer acts as their superior
      while (currentCheckUserId) {
        if (currentCheckUserId === reviewerId) {
          isSuperior = true;
          break;
        }
        const superUser = await User.findOne({
          where: { id: currentCheckUserId },
        });
        if (!superUser) break;
        currentCheckUserId = superUser.managerId;
      }

      if (!isSuperior) {
        res.status(403).json({
          message:
            'Forbidden: You only have permission to review reimbursements from your direct or downstream subordinates',
        });
        return;
      }
    }

    reimbursement.status = status;
    reimbursement.reviewedBy = reviewerId;

    if (status === 'rejected') {
      (reimbursement as any).rejectionReason = rejectionReason;
    } else {
      (reimbursement as any).rejectionReason = null; // Purge old reasons if transitioning
    }

    await reimbursement.save();
    res.json(reimbursement);
  } catch (error) {
    console.error('Error securely updating reimbursement approval:', error);
    res.status(500).json({
      message: 'Internal server error while processing financial state changes',
    });
  }
};

export const getReimbursementRequests = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const reviewerId = req.user?.id;
    const reviewerRole = req.user?.role;
    const { status, startDate, endDate } = req.query;

    let activeSubordinateIds: number[] = [];

    if (reviewerRole !== 'admin') {
      const allSubordinates = new Set<number>();

      let currentLevel = await User.findAll({
        where: { managerId: reviewerId },
      });

      while (currentLevel.length > 0) {
        const nextLevelIds: number[] = [];
        for (const u of currentLevel) {
          allSubordinates.add(u.id);
          nextLevelIds.push(u.id);
        }

        const nextLevelQueries = await Promise.all(
          nextLevelIds.map((managerId) =>
            User.findAll({ where: { managerId } }),
          ),
        );

        currentLevel = nextLevelQueries.flat();
      }

      if (allSubordinates.size === 0) {
        res.status(200).json([]);
        return;
      }

      activeSubordinateIds = Array.from(allSubordinates);
    }

    const whereClause: any = { type: 'reimbursement' };

    // Restrict view scope if they are a manager
    if (reviewerRole !== 'admin') {
      whereClause.userId = { [Op.in]: activeSubordinateIds };
    }

    if (status) {
      whereClause.status = status;
    }

    if (startDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        [Op.gte]: new Date(startDate as string),
      };
    }

    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        [Op.lte]: new Date(endDate as string),
      };
    }

    const requests = await PayrollAdjustment.findAll({
      where: whereClause,
      include: [{ model: User, as: 'user' }],
      order: [['createdAt', 'DESC']],
    });

    // Sanitize user passwords
    const sanitizedRequests = requests.map((reqData) => {
      const sanitized = (reqData as any).toJSON();
      if (sanitized.user) {
        delete sanitized.user.password;
      }
      return sanitized;
    });

    res.status(200).json(sanitizedRequests);
  } catch (error) {
    console.error('Error retrieving reimbursement requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User's recent reimbursements (for dashboard activities)
export const getUserRecentReimbursements = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Fetch reimbursements from past 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const reimbursements = await PayrollAdjustment.findAll({
      where: {
        userId,
        type: 'reimbursement',
        createdAt: { [Op.gte]: threeDaysAgo },
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.status(200).json(reimbursements);
  } catch (error) {
    console.error('Error fetching user recent reimbursements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
