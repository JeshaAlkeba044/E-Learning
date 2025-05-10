import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Course } from './Course';
import { v4 } from 'uuid';

@Table({ tableName: 'materials' })
export class Material extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4(),
  })
  id_material!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.STRING,
  })
  video_link!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_free!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  sequence_order!: number;

  // Relasi: Material dimiliki oleh 1 Course
  @ForeignKey(() => Course)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_course!: string;

  @BelongsTo(() => Course)
  course!: Course;
}