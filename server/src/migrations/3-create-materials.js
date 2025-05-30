'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('materials', {
      id_material: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      topic: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      is_free: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sequence_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_course: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id_course',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('materials');
  }
};
