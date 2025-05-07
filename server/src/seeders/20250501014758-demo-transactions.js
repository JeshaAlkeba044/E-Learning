'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('transactions', [
      {
        amount: 99.99,
        payment_method: 'credit_card',
        status: 'completed',
        id_user: 3, // Student 1
        id_course: 1, // Web Development Basics
        transaction_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transactions', null, {});
  }
};
