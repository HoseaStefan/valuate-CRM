import { Response } from 'express';
import { Op } from 'sequelize';
import { verifyQrSignature, generateAttendanceQRCode } from '../services/attendanceService';
import { Attendance } from '../models/attendances';
import { User } from '../models/users';
import { AuthRequest } from '../middleware/authMiddleware';

// Get attendance history. If userId omitted, returns requester's records (unless admin sets userId)
export const getAttendanceHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId, month, year } = req.query as any;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    let targetUserId: number | undefined = undefined;
    if (userId) {
      targetUserId = Number(userId);
      if (isNaN(targetUserId)) {
        res.status(400).json({ message: 'Invalid userId' });
        return;
      }
      if (requesterRole !== 'admin' && targetUserId !== requesterId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
    } else {
      targetUserId = requesterId;
    }

    const now = new Date();
    const m = month ? Number(month) : now.getMonth() + 1; // 1-12
    const y = year ? Number(year) : now.getFullYear();

    if (m < 1 || m > 12) {
      res.status(400).json({ message: 'Invalid month' });
      return;
    }

    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0);

    const where: any = {
      date: {
        [Op.between]: [
          monthStart.toISOString().slice(0, 10),
          monthEnd.toISOString().slice(0, 10),
        ],
      },
    };
    if (targetUserId) where.userId = targetUserId;

    const records = await Attendance.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'fullName'] }],
      order: [['date', 'ASC']],
    });

    res
      .status(200)
      .json({ month: `${y}-${String(m).padStart(2, '0')}`, data: records });
  } catch (error) {
    console.error('Error getting attendance history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: update attendance record (change status to 'late' etc.)
export const updateAttendance = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid attendance id' });
      return;
    }

    const { status, clockIn, clockOut, notes } = req.body as any;
    const allowed = ['present', 'absent', 'late', 'excused'];
    if (status && !allowed.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const record = await Attendance.findOne({ where: { id } });
    if (!record) {
      res.status(404).json({ message: 'Attendance not found' });
      return;
    }

    if (status) record.status = status;
    if (clockIn !== undefined) record.clockIn = clockIn;
    if (clockOut !== undefined) record.clockOut = clockOut;
    if (notes !== undefined) record.notes = notes;

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generate QR code for today's attendance
export const generateQR = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  console.log("Generating QR for user", req.user?.id);
  try {
    const { qrImageUrl } = generateAttendanceQRCode();
    res.status(200).json({ qrImageUrl });
    
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const scanQR = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { qr } = req.body as any;
    if (!qr) {
      res.status(400).json({ message: 'Missing qr payload' });
      return;
    }

    // Accept either an object or JSON string in the `qr` body field
    let parsed: any = qr;
    if (typeof qr === 'string') {
      try {
        parsed = JSON.parse(qr);
      } catch (e) {
        // if it's not JSON, treat it as raw message (no signature)
        parsed = { message: qr };
      }
    }

    // Expect payload to include `signature` (base64). Determine action by checking
    // whether an attendance record for this user exists for today.
    const signature: string | undefined = parsed?.signature || parsed?.sig;

    if (!signature) {
      res.status(400).json({ message: 'QR must contain signature' });
      return;
    }

    const valid = verifyQrSignature(signature);
    if (!valid) {
      res.status(400).json({ valid: false, message: 'Invalid QR signature' });
      return;
    }

    // Valid QR — record attendance for the requesting user determined by record existence
    const userId = req.user?.id;
    if (!userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const dateString = new Date().toISOString().slice(0, 10);
    let record = await Attendance.findOne({
      where: { userId, date: dateString },
    });

    const now = new Date();
    const timeString = now.toTimeString().slice(0, 8); // HH:MM:SS

    // No record => treat as clock_in
    if (!record) {
      record = await Attendance.create({
        userId,
        date: dateString,
        clockIn: timeString,
        clockOut: '00:00:00',
        status: 'present',
        notes: null,
      } as any);

      res.status(200).json({ valid: true, action: 'clockIn', record });
      return;
    }

    // Record exists => treat as clock_out (update clockOut if not already set)
    if (record.clockOut === '00:00:00') {
      record.clockOut = timeString;
      await record.save();
      res.status(200).json({ valid: true, action: 'clockOut', record });
      return;
    }

    res
      .status(200)
      .json({
        valid: true,
        message: 'Already clocked in and out today',
        record,
      });
  } catch (error) {
    console.error('Error scanning QR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
