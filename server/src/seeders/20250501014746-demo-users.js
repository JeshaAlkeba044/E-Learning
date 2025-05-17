'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id_user: uuidv4(),
        firstName: 'John',
        lastName: 'Doe',
        hashEmail: 'hashed_john@example.com',
        encryptedEmail: 'encrypted_john@example.com',
        password: hashedPassword,
        phone_number: '081234567890',
        photo_path: '/photos/john.jpg',
        bio: 'Experienced Math tutor with a passion for teaching.',
        specialization: 'Mathematics',
        YoE: '5 years',
        linkPorto: 'https://portfolio.johndoe.com',
        role: 'tutor',
        statusUser: 'verified',
        registration_date: new Date(),
        updated_at: new Date()
      },
      {
        id_user: uuidv4(),
        firstName: 'Jane',
        lastName: 'Smith',
        hashEmail: 'hashed_jane@example.com',
        encryptedEmail: 'encrypted_jane@example.com',
        password: hashedPassword,
        phone_number: '089876543210',
        photo_path: '/photos/jane.jpg',
        bio: 'Aspiring software developer looking for learning opportunities.',
        specialization: '',
        YoE: '',
        linkPorto: '',
        role: 'learner',
        statusUser: 'none',
        registration_date: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
