import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { PayrollAdjustment } from '../entities/PayrollAdjustment';
import { User } from '../entities/User';
import { AuthRequest } from '../middleware/authMiddleware';

const adjustmentRepository = AppDataSource.getRepository(PayrollAdjustment);
const userRepository = AppDataSource.getRepository(User);

export const createReimbursement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, amount, description, proofPath } = req.body;

    // Validate inputs
    if (!title || typeof amount !== 'number' || Math.abs(amount) <= 0) {
      res.status(400).json({ message: 'Title and a valid positive mathematical amount are required' });
      return;
    }

    // Check Proof Path
    if (!proofPath) {
      res.status(400).json({ message: 'Proof path is required' });
      return;
    }

    const newReimbursement = adjustmentRepository.create({
      userId,
      title,
      type: 'reimbursement',
      amount: Math.abs(amount),
      description: description || null,
      proofPath: proofPath,
      status: 'pending'
    });

    await adjustmentRepository.save(newReimbursement);
    res.status(201).json(newReimbursement);
  } catch (error) {
    console.error('Error creating reimbursement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateReimbursementApproval = async (req: AuthRequest, res: Response): Promise<void> => {
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
      res.status(400).json({ message: 'Status must be tightly set to either approved or rejected' });
      return;
    }

    // Rejection Logic
    if (status === 'rejected' && (!rejectionReason || String(rejectionReason).trim() === '')) {
      res.status(400).json({ message: 'Rejection reason is strictly required when declining a reimbursement request' });
      return;
    }

    const reimbursement = await adjustmentRepository.findOne({ where: { id, type: 'reimbursement' }, relations: ['user'] });

    if (!reimbursement) {
      res.status(404).json({ message: 'Reimbursement request not found in database records' });
      return;
    }

    if (reimbursement.userId === reviewerId) {
      res.status(403).json({ message: 'Forbidden: Security mechanism preventing users from approving or rejecting their own personal reimbursement requests' });
      return;
    }

    // Role Hierarchy Authorization
    if (reviewerRole !== 'admin') {
      let isSuperior = false;
      let currentCheckUserId = reimbursement.user.managerId;

      // Check if reviewer acts as their superior
      while (currentCheckUserId) {
        if (currentCheckUserId === reviewerId) {
          isSuperior = true;
          break;
        }
        const superUser = await userRepository.findOne({ where: { id: currentCheckUserId } });
        if (!superUser) break;
        currentCheckUserId = superUser.managerId;
      }

      if (!isSuperior) {
        res.status(403).json({ message: 'Forbidden: You only have permission to review reimbursements from your direct or downstream subordinates' });
        return;
      }
    }

    reimbursement.status = status;
    reimbursement.reviewedById = reviewerId;

    if (status === 'rejected') {
      reimbursement.rejectionReason = rejectionReason;
    } else {
      reimbursement.rejectionReason = null; // Purge old reasons if transitioning
    }

    await adjustmentRepository.save(reimbursement);
    res.json(reimbursement);
  } catch (error) {
    console.error('Error securely updating reimbursement approval:', error);
    res.status(500).json({ message: 'Internal server error while processing financial state changes' });
  }
};

export const getReimbursementRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewerId = req.user?.id;
    const reviewerRole = req.user?.role;
    const { status, startDate, endDate } = req.query;

    let activeSubordinateIds: number[] = [];


    if (reviewerRole !== 'admin') {
      const allSubordinates = new Set<number>();

      let currentLevel = await userRepository.find({ where: { managerId: reviewerId } });

      while (currentLevel.length > 0) {
        const nextLevelIds: number[] = [];
        for (const u of currentLevel) {
          allSubordinates.add(u.id);
          nextLevelIds.push(u.id);
        }

        const nextLevelQueries = await Promise.all(
          nextLevelIds.map(managerId => userRepository.find({ where: { managerId } }))
        );

        currentLevel = nextLevelQueries.flat();
      }

      if (allSubordinates.size === 0) {
        res.status(200).json([]);
        return;
      }

      activeSubordinateIds = Array.from(allSubordinates);
    }

    const query = adjustmentRepository.createQueryBuilder('adj')
      .leftJoinAndSelect('adj.user', 'user')
      .where('adj.type = :type', { type: 'reimbursement' });

    // Restrict view scope if they are a manager
    if (reviewerRole !== 'admin') {
      query.andWhere('adj.userId IN (:...subordinateIds)', { subordinateIds: activeSubordinateIds });
    }

    if (status) {
      query.andWhere('adj.status = :status', { status });
    }

    if (startDate) {
      // Convert string to Date
      query.andWhere('adj.createdAt >= :startDate', { startDate: new Date(startDate as string) });
    }

    if (endDate) {
      query.andWhere('adj.createdAt <= :endDate', { endDate: new Date(endDate as string) });
    }

    // Sort by newest requests first
    query.orderBy('adj.createdAt', 'DESC');

    const requests = await query.getMany();

    // Sanitize user passwords
    const sanitizedRequests = requests.map(reqData => {
      if (reqData.user) {
        const sanitizedUser = { ...reqData.user };
        delete (sanitizedUser as any).password;
        reqData.user = sanitizedUser as User;
      }
      return reqData;
    });

    res.status(200).json(sanitizedRequests);
  } catch (error) {
    console.error('Error retrieving reimbursement requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
