import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { LeaveRequest } from '../models/leaveRequest';
import { User } from '../models/users';
import { AuthRequest } from '../middleware/authMiddleware';

// Staff: request leave
export const requestLeave = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { reason, startDate, days, endDate } = req.body as any;

    if (!reason || !startDate || !(days || endDate)) {
      res.status(400).json({
        message:
          'Missing required fields: reason, startDate, and (days or endDate)',
      });
      return;
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      res.status(400).json({ message: 'Invalid startDate' });
      return;
    }

    // start cannot be before today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (start < todayStart) {
      res.status(400).json({ message: 'startDate cannot be before today' });
      return;
    }

    let end: Date;
    if (days) {
      const n = Number(days);
      if (isNaN(n) || n <= 0) {
        res.status(400).json({ message: 'Invalid days value' });
        return;
      }
      end = new Date(start);
      end.setDate(end.getDate() + n - 1);
    } else {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        res.status(400).json({ message: 'Invalid endDate' });
        return;
      }
    }

    // end must not be before start
    if (end < start) {
      res.status(400).json({ message: 'endDate cannot be before startDate' });
      return;
    }

    const newReq = await LeaveRequest.create({
      userId,
      reason,
      startDate: start,
      endDate: end,
      status: 'pending',
      reviewedBy: null,
      rejectionReason: null,
    });

    res.status(201).json(newReq);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Manager or Admin: approve or reject a leave request
export const leaveApproval = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const approverId = req.user?.id;
    const approverRole = req.user?.role;
    if (!approverId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid request id' });
      return;
    }

    const { action, rejectionReason } = req.body as any; // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
      return;
    }

    const leave = await LeaveRequest.findOne({
      where: { id },
      include: [User],
    });
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    // Only admin or the user's manager can approve/reject
    const targetUser = leave.user as User | undefined;
    const isManager = targetUser && targetUser.managerId === approverId;
    if (approverRole !== 'admin' && !isManager) {
      res.status(403).json({
        message: 'Forbidden: only manager or admin can review leave requests',
      });
      return;
    }

    if (action === 'approve') {
      leave.status = 'approved';
      leave.rejectionReason = null;
    } else {
      leave.status = 'rejected';
      leave.rejectionReason = rejectionReason || null;
    }

    leave.reviewedBy = approverId;
    await leave.save();

    res.status(200).json(leave);
  } catch (error) {
    console.error('Error approving/rejecting leave request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Calendar view for a month. Query params: month (1-12), year, all=true to request all users when staff
export const calendarView = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const requesterRole = req.user?.role;
    const requesterId = req.user?.id;

    const month = Number(req.query.month) || new Date().getMonth() + 1; // 1-12
    const year = Number(req.query.year) || new Date().getFullYear();
    const allowAll = req.query.all === 'true';

    if (month < 1 || month > 12) {
      res.status(400).json({ message: 'Invalid month' });
      return;
    }

    const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    const where: any = {
      // overlap: startDate <= monthEnd AND endDate >= monthStart
      startDate: { [Op.lte]: monthEnd },
      endDate: { [Op.gte]: monthStart },
    };

    if (requesterRole === 'admin') {
      // admin sees all
    } else if (allowAll) {
      // staff explicitly requested all; allow but could be toggled off by policy
    } else {
      // default: staff see only their own
      where.userId = requesterId;
    }

    const leaves = await LeaveRequest.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'fullName', 'role'] }],
    });
    res.status(200).json({
      month: `${year}-${String(month).padStart(2, '0')}`,
      data: leaves,
    });
  } catch (error) {
    console.error('Error fetching calendar view:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin-only: edit a leave request
export const editRequestLeave = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const requesterRole = req.user?.role;
    if (requesterRole !== 'admin') {
      res
        .status(403)
        .json({ message: 'Forbidden: only admin can edit leave requests' });
      return;
    }

    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid request id' });
      return;
    }

    const { reason, startDate, endDate, status } = req.body as any;
    const leave = await LeaveRequest.findOne({ where: { id } });
    if (!leave) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    if (reason !== undefined) leave.reason = reason;
    if (startDate !== undefined) {
      const s = new Date(startDate);
      if (isNaN(s.getTime())) {
        res.status(400).json({ message: 'Invalid startDate' });
        return;
      }
      // prevent setting start before today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      if (s < todayStart) {
        res.status(400).json({ message: 'startDate cannot be before today' });
        return;
      }
      leave.startDate = s;
    }
    if (endDate !== undefined) {
      const e = new Date(endDate);
      if (isNaN(e.getTime())) {
        res.status(400).json({ message: 'Invalid endDate' });
        return;
      }
      // ensure end is not before start
      const compareStart =
        startDate !== undefined ? new Date(startDate) : leave.startDate;
      if (e < compareStart) {
        res.status(400).json({ message: 'endDate cannot be before startDate' });
        return;
      }
      leave.endDate = e;
    }
    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }
      leave.status = status;
    }

    await leave.save();
    res.status(200).json(leave);
  } catch (error) {
    console.error('Error editing leave request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User's leave history (optional month/year filtering)
export const getUserLeaveHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { month, year, status, limit } = req.query as any;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    if (month || year) {
      const y = year ? Number(year) : new Date().getFullYear();
      if (isNaN(y)) {
        res.status(400).json({ message: 'Invalid year' });
        return;
      }

      if (month) {
        const m = Number(month);
        if (isNaN(m) || m < 1 || m > 12) {
          res.status(400).json({ message: 'Invalid month' });
          return;
        }

        const monthStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);
        where.startDate = { [Op.lte]: monthEnd };
        where.endDate = { [Op.gte]: monthStart };
      } else {
        const yearStart = new Date(y, 0, 1, 0, 0, 0, 0);
        const yearEnd = new Date(y, 11, 31, 23, 59, 59, 999);
        where.startDate = { [Op.lte]: yearEnd };
        where.endDate = { [Op.gte]: yearStart };
      }
    }

    const parsedLimit = limit ? Number(limit) : undefined;

    const leaves = await LeaveRequest.findAll({
      where,
      order: [['createdAt', 'DESC']],
      ...(parsedLimit && parsedLimit > 0 ? { limit: parsedLimit } : {}),
    });

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching user leave history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User's recent leave requests (for dashboard activities)
export const getUserRecentLeaves = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Fetch leaves from past 3 days to now
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const leaves = await LeaveRequest.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: threeDaysAgo,
        },
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching user recent leaves:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
