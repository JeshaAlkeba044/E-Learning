'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('materials', [
      {
        title: 'Introduction to HTML',
        content: 'HTML is the standard markup language...',
        video_link: 'https://example.com/video1',
        is_free: true,
        sequence_order: 1,
        id_course: 1, // Web Development Basics
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'CSS Styling',
        content: 'CSS is used to style HTML elements...',
        video_link: 'https://example.com/video2',
        is_free: false,
        sequence_order: 2,
        id_course: 1, // Web Development Basics
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('materials', null, {});
  }
};
