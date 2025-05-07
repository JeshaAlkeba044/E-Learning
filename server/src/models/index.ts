import { Sequelize } from 'sequelize-typescript';
import { User } from './User';
import { Course } from './Course';
import { Material } from './Material';
import { Transaction } from './Transaction';

const sequelize = new Sequelize({
  database: 'e_learning',
  username: 'root',
  password: '',
  host: 'localhost',
  dialect: 'mysql',
  models: [User, Course, Material, Transaction],
});

export { sequelize, User, Course, Material, Transaction };