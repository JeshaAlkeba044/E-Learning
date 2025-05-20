import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Material } from './Material';
import { Transaction } from './Transaction';
import { v4 } from 'uuid';

@Table({ tableName: 'courses' , timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
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
    allowNull: false,
  })
  category!: string;

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
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'beginner',
  })
  level!: string; // beginner, intermediate, advanced

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  total_duration!: number; // in minutes

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'created_at',
  })
  created_at!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'updated_at',
  })
  updated_at!: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  is_active!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user!: string;

  @BelongsTo(() => User)
  instructor_Id!: User;

  @HasMany(() => Material)
  materials_id!: Material[];

  @HasMany(() => Transaction)
  transactions_id!: Transaction[];
}