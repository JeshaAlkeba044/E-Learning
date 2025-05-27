import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
import { Material } from './Material';
import { v4 } from 'uuid';

@Table({ tableName: 'user_material_progress', timestamps: false })
export class UserMaterialProgress extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: v4(),
  })
  id_progress!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_user!: string;

  @ForeignKey(() => Material)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id_material!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_completed!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  last_accessed!: Date;
}