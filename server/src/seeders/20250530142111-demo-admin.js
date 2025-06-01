'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { encrypt } = require('../../dist/utils/cryptoUtil');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    await queryInterface.bulkInsert('users', [
      {
        id_user: uuidv4(),
        firstName: encrypt('Admin'),
        lastName: encrypt('1'),
        hashEmail: encrypt('admin1@example.com'),
        encryptedEmail: encrypt('admin1@example.com'),
        password: hashedPassword,
        phone_number: encrypt('081234567890'),
        photo_path: encrypt('/uploads/defaultPic.png'),
        bio: encrypt('Experienced Math tutor with a passion for teaching.'),
        specialization: encrypt('Mathematics'),
        YoE: encrypt('5 years'),
        linkPorto: encrypt(''), // boleh string kosong
        role: encrypt('admin'),
        statusUser: encrypt('none'),
        registration_date: new Date(),
        updated_at: new Date()
      },
      {
        id_user: uuidv4(),
        firstName: encrypt('Admin'),
        lastName: encrypt('2'),
        hashEmail: encrypt('dmin2@example.com'),
        encryptedEmail: encrypt('admin2@example.com'),
        password: hashedPassword,
        phone_number: encrypt('089876543210'),
        photo_path: encrypt('/uploads/defaultPic.png'),
        bio: encrypt('Aspiring software developer looking for learning opportunities.'),
        specialization: encrypt(''),
        YoE: encrypt(''),
        linkPorto: encrypt(''),
        role: encrypt('admin'),
        statusUser: encrypt('none'),
        registration_date: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
