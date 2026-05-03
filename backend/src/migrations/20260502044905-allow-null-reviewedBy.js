'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Use raw SQL to allow null on reviewedBy column
    await queryInterface.sequelize.query(
      `ALTER TABLE "PayrollAdjustments" ALTER COLUMN "reviewedBy" DROP NOT NULL;`
    );
  },

  async down (queryInterface, Sequelize) {
    // Revert: set NOT NULL constraint back
    await queryInterface.sequelize.query(
      `ALTER TABLE "PayrollAdjustments" ALTER COLUMN "reviewedBy" SET NOT NULL;`
    );
  }
};
