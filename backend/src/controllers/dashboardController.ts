import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/users';
import { Attendance } from '../models/attendances';
import { PayrollAdjustment } from '../models/payrollAdjustment';
import { LeaveRequest } from '../models/leaveRequest';
import { Op } from 'sequelize';

export const getDashboardData = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const reviewerRole = req.user?.role;
    const reviewerId = req.user?.id;

    let targetUserIds: string[] = [];

    // If not admin, scope to downstream team
    if (reviewerRole !== 'admin' && reviewerId) {
      const allSubordinates = new Set<string>();

      let currentLevel = await User.findAll({
        where: { managerId: reviewerId },
      });

      while (currentLevel.length > 0) {
        const nextLevelIds: string[] = [];
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

      targetUserIds = Array.from(allSubordinates);

      // Include themselves in some cases, but for dashboard metrics, 
      // usually it's just the downstream or themselves + downstream.
      targetUserIds.push(reviewerId);
    }

    const today = new Date();
    // format YYYY-MM-DD
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 1. Total Users
    let totalUsers = 0;
    if (reviewerRole === 'admin') {
      totalUsers = await User.count();
    } else {
      totalUsers = targetUserIds.length;
    }

    // 2. Present Today
    const attendanceWhere: any = { date: todayStr, status: 'present' };
    if (reviewerRole !== 'admin') {
      attendanceWhere.userId = { [Op.in]: targetUserIds };
    }
    const presentToday = await Attendance.count({ where: attendanceWhere });

    // 3. Pending Reimburse
    const reimburseWhere: any = { type: 'reimbursement', status: 'pending' };
    if (reviewerRole !== 'admin') {
      reimburseWhere.userId = { [Op.in]: targetUserIds };
    }
    const pendingReimburse = await PayrollAdjustment.count({ where: reimburseWhere });

    // 4. Leave Requests (pending)
    const leaveWhere: any = { status: 'pending' };
    if (reviewerRole !== 'admin') {
      leaveWhere.userId = { [Op.in]: targetUserIds };
    }
    const pendingLeave = await LeaveRequest.count({ where: leaveWhere });

    // 5. Recent Activity
    // Fetch recent leaves
    const recentLeavesWhere: any = {};
    if (reviewerRole !== 'admin') {
      recentLeavesWhere.userId = { [Op.in]: targetUserIds };
    }
    const recentLeaves = await LeaveRequest.findAll({
      where: recentLeavesWhere,
      include: [{ model: User, as: 'user', attributes: ['fullName'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Fetch recent reimbursements
    const recentReimburseWhere: any = { type: 'reimbursement' };
    if (reviewerRole !== 'admin') {
      recentReimburseWhere.userId = { [Op.in]: targetUserIds };
    }
    const recentReimbursements = await PayrollAdjustment.findAll({
      where: recentReimburseWhere,
      include: [{ model: User, as: 'user', attributes: ['fullName'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Combine and format activities
    let activities: any[] = [];
    
    for (const leave of recentLeaves) {
      activities.push({
        action: `User ${(leave as any).user?.fullName || 'Unknown'} requested ${leave.reason} leave`,
        time: leave.createdAt,
        type: 'leave'
      });
    }

    for (const reimb of recentReimbursements) {
      activities.push({
        action: `User ${(reimb as any).user?.fullName || 'Unknown'} submitted a reimbursement`,
        time: reimb.createdAt,
        type: 'reimbursement'
      });
    }

    // Sort combined by time descending
    activities.sort((a, b) => b.time.getTime() - a.time.getTime());

    // Take top 5 and format time string (simplified for frontend to use)
    const recentActivity = activities.slice(0, 5).map(act => ({
      action: act.action,
      time: act.time.toISOString() // frontend will calculate '2 hours ago'
    }));

    res.json({
      metrics: {
        totalUsers,
        presentToday,
        pendingReimburse,
        pendingLeave
      },
      activities: recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
