'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('courses', [
      {
        title: 'Web Development Basics',
        description: 'Learn the basics of web development',
        price: 99.99,
        id_user: 2, // Instructor 1
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Advanced JavaScript',
        description: 'Deep dive into JavaScript',
        price: 149.99,
        id_user: 2, // Instructor 1
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('courses', null, {});
  }
};
