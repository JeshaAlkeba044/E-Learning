import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Course } from './Course';
import { Transaction } from './Transaction';
import { v4 } from 'uuid';

@Table({ tableName: 'users', timestamps: false })
export class User extends Model {
  @Column({
    type: DataType.UUIDV4,
    primaryKey: true,
    defaultValue: () => v4(),
  })
  id_user!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName!: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  hashEmail!: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  encryptedEmail!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING,
  })
  phone_number!: string;

  @Column({
    type: DataType.STRING,
  })
  photo_path!: string;

  @Column({
    type: DataType.TEXT,
  })
  bio!: string;

  @Column({
    type: DataType.STRING,
  })
  specialization!: string;
  
  @Column({
    type: DataType.STRING,
  })
  YoE!: string;
  
  @Column({
    type: DataType.STRING,
  })
  linkPorto!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'learner',
  })
  role!: string;

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: ['subscribed', 'verified', 'none'],
    defaultValue: 'none'
  })
  statusUser!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  registration_date!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'updated_at',
  })
  updatedAt!: Date;

  // Relasi: 1 User memiliki banyak Course (sebagai instructor)
  @HasMany(() => Course)
  courses!: Course[];

  // Relasi: 1 User memiliki banyak Transaction
  @HasMany(() => Transaction)
  transactions!: Transaction[];
}



