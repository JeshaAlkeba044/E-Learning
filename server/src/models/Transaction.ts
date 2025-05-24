import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Course } from './Course';
import { v4 } from 'uuid';

@Table({ tableName: 'transactions', timestamps: false, // ⬅️ MATIKAN ini kalau gak pakai field createdAt & updatedAt
 })
export class Transaction extends Model {
  @Column({
    type: DataType.UUIDV4,
    primaryKey: true,
    defaultValue: v4(),
  })
  id_transaction!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  transaction_date!: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  payment_method!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  status!: string;

  // Relasi: Transaction dimiliki oleh 1 User
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user!: string;

  @BelongsTo(() => User)
  user!: User;

  // Relasi: Transaction dimiliki oleh 1 Course
  @ForeignKey(() => Course)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_course!: string;

  @BelongsTo(() => Course)
  course!: Course;

    @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updated_at!: Date;
}