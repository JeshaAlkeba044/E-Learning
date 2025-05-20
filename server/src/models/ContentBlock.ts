import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { v4 } from 'uuid';

@Table({ tableName: 'content_blocks' })
export class ContentBlock extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4(),
  })
  id_block!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type!: string; // 'text', 'image', 'video', 'code', 'quiz', etc.

  @Column({
    type: DataType.TEXT,
  })
  content!: string; // Actual content or reference to media

  @Column({
    type: DataType.JSON,
  })
  metadata!: any; // Additional properties like width, alignment, etc.

  @Column({
    type: DataType.STRING,
  })
  created_by!: string; // User ID who created this block

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