'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('payroll', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      month: {
        allowNull: false,
        type: Sequelize.STRING
      },
      year: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      baseSalary: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2)
      },
      totalAdjustments: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2)
      },
      netSalary: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2)
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('pending', 'paid', 'failed')
      },
      paymentDate: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('payroll');
  }
};
