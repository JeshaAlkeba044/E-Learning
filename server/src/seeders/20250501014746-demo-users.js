'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        id_user: Sequelize.UUIDV4(),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: '$2b$10$examplehashedpassword', // Ganti dengan bcrypt hash valid
        phone_number: null,
        photo_path: null,
        bio: null,
        specialization: 'Management',
        YoE: '10',
        linkPorto: null,
        role: 'admin',
        statusUser: 'none',
        registration_date: new Date(),
        updated_at: new Date(),
      },
      {
        id_user: Sequelize.UUIDV4(),
        firstName: 'Instructor',
        lastName: 'One',
        email: 'instructor1@example.com',
        password: '$2b$10$examplehashedpassword',
        phone_number: null,
        photo_path: null,
        bio: null,
        specialization: 'Software Engineering',
        YoE: '5',
        linkPorto: null,
        role: 'tutor',
        statusUser: 'none',
        registration_date: new Date(),
        updated_at: new Date(),
      },
      {
        id_user: Sequelize.UUIDV4(),
        firstName: 'Student',
        lastName: 'One',
        email: 'student1@example.com',
        password: '$2b$10$examplehashedpassword',
        phone_number: null,
        photo_path: null,
        bio: null,
        specialization: 'Frontend Development',
        YoE: '0',
        linkPorto: null,
        role: 'learner',
        statusUser: 'none',
        registration_date: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
