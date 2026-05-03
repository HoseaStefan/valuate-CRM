'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // ambil semua user staff
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "users" WHERE role = 'staff';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!users.length) throw new Error('No staff users found.');

    const userIds = users.map((u) => u.id);

    // ambil admin sebagai reviewer
    const admins = await queryInterface.sequelize.query(
      `SELECT id FROM "users" WHERE role = 'admin' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const adminId = admins.length ? admins[0].id : null;

    // ============================
    // 1) ATTENDANCE May 1 - May 3
    // ============================
    const attendances = [];

    const attendanceData = [
      {
        date: '2026-05-01',
        clockIn: '08:00:00',
        clockOut: '17:00:00',
        status: 'present',
        notes: null,
      },
      {
        date: '2026-05-02',
        clockIn: '08:30:00',
        clockOut: '17:00:00',
        status: 'late',
        notes: 'Late because traffic',
      },
      {
        date: '2026-05-03',
        clockIn: '00:00:00',
        clockOut: '00:00:00',
        status: 'absent',
        notes: 'Did not come to office',
      },
    ];

    for (const userId of userIds) {
      for (const data of attendanceData) {
        attendances.push({
          userId,
          date: data.date,
          clockIn: data.clockIn,
          clockOut: data.clockOut,
          status: data.status,
          notes: data.notes,
        });
      }
    }

    await queryInterface.bulkInsert('attendances', attendances, {});

    // ============================
    // 2) LEAVE REQUEST (approved + pending + rejected)
    // ============================
    const leaveRequests = [];

    const leaveSamples = [
      {
        reason: 'vacation',
        startDate: '2026-05-03',
        endDate: '2026-05-06',
        status: 'approved',
        reviewedBy: adminId,
        rejectionReason: null,
      },
      {
        reason: 'sick leave',
        startDate: '2026-05-07',
        endDate: '2026-05-09',
        status: 'pending',
        reviewedBy: null,
        rejectionReason: null,
      },
      {
        reason: 'personal leave',
        startDate: '2026-05-10',
        endDate: '2026-05-12',
        status: 'rejected',
        reviewedBy: adminId,
        rejectionReason: 'Not enough supporting documents',
      },
    ];

    // ambil 10 staff pertama
    const leaveUsers = userIds.slice(0, 10);

    for (let i = 0; i < leaveUsers.length; i++) {
      const sample = leaveSamples[i % leaveSamples.length];

      leaveRequests.push({
        userId: leaveUsers[i],
        reason: sample.reason,
        startDate: sample.startDate,
        endDate: sample.endDate,
        status: sample.status,
        reviewedBy: sample.reviewedBy,
        rejectionReason: sample.rejectionReason,
        createdAt: now,
        updatedAt: now,
      });
    }

    await queryInterface.bulkInsert('leaveRequests', leaveRequests, {});

    // ============================
    // 3) PAYROLL ADJUSTMENTS (approved + pending + rejected)
    // ============================
    const payrollAdjustments = [];

    const adjustmentTypes = [
      'bonus',
      'deduction',
      'damage',
      'lateFine',
      'reimbursement',
      'others',
    ];

    for (const userId of userIds) {
      for (let i = 0; i < adjustmentTypes.length; i++) {
        const type = adjustmentTypes[i];

        // rotate status biar mix
        let status = 'approved';
        let reviewedBy = adminId;
        let rejectionReason = null;

        if (i % 3 === 1) {
          status = 'pending';
          reviewedBy = null;
        }

        if (i % 3 === 2) {
          status = 'rejected';
          reviewedBy = adminId;
          rejectionReason = 'Not valid / missing proof';
        }

        payrollAdjustments.push({
          userId,
          title: `${type.toUpperCase()} Adjustment`,
          type,
          amount: (100000 + i * 50000).toString(),
          description: `Dummy adjustment for ${type}`,
          proofPath: null,
          status,
          reviewedBy,
          rejectionReason,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert('PayrollAdjustments', payrollAdjustments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('attendances', {
      date: {
        [Sequelize.Op.in]: ['2026-05-01', '2026-05-02', '2026-05-03'],
      },
    });

    await queryInterface.bulkDelete('leaveRequests', {
      startDate: {
        [Sequelize.Op.between]: [new Date('2026-05-03'), new Date('2026-05-12')],
      },
    });

    await queryInterface.bulkDelete('PayrollAdjustments', {
      createdAt: {
        [Sequelize.Op.lte]: new Date(),
      },
    });
  },
};