import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Course } from './Course';
import { v4 } from 'uuid';

@Table({ tableName: 'materials' , timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at'})
export class Material extends Model {
  @Column({
    type: DataType.UUIDV4,
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
    type: DataType.STRING,
  })
  topic!: string;

  @Column({
    type: DataType.JSON, 
    allowNull: false,
  })
  content!: any; 
  
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  duration!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_free!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_locked!: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  sequence_order!: number;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_course!: string;

  @BelongsTo(() => Course)
  course!: Course;
}