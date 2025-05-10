import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Material } from './Material';
import { Transaction } from './Transaction';
import { v4 } from 'uuid';

@Table({ tableName: 'courses' })
export class Course extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4(),
  })
  id_course!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.STRING,
  })
  thumbnail_path!: string;

  @Column({
    type: DataType.TEXT,
  })
  description!: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  price!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at!: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_active!: boolean;

  // Relasi: Course dimiliki oleh 1 User (instructor)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user!: string;

  @BelongsTo(() => User)
  instructor!: User;

  // Relasi: 1 Course memiliki banyak Material
  @HasMany(() => Material)
  materials!: Material[];

  // Relasi: 1 Course dimiliki oleh banyak Transaction
  @HasMany(() => Transaction)
  transactions!: Transaction[];
}