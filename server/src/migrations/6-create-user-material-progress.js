'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_material_progress', {
      id_progress: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      id_user: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id_user',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_material: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'materials',
          key: 'id_material',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      last_accessed: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_material_progress');
  }
};
