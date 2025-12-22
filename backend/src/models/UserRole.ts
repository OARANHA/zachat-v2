import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import User from './User';
import Role from './Role';
import Tenant from './Tenant';

@Table({
  tableName: 'UserRoles',
  underscored: false,
  timestamps: false,
})
export default class UserRole extends Model<UserRole> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    field: 'userId',
    allowNull: false,
  })
  userId!: number;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    field: 'roleId',
    allowNull: false,
  })
  roleId!: number;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.INTEGER,
    field: 'tenantId',
    allowNull: false,
  })
  tenantId!: number;

  @Column({
    type: DataType.INTEGER,
    field: 'assignedBy',
    allowNull: true,
  })
  assignedBy?: number;

  @Column({
    type: DataType.DATE,
    field: 'expiresAt',
    allowNull: true,
  })
  expiresAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    field: 'isDefault',
    defaultValue: false,
    allowNull: false,
  })
  isDefault!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'createdAt',
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'updatedAt',
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  updatedAt!: Date;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => Role, 'roleId')
  role!: Role;

  @BelongsTo(() => Tenant, 'tenantId')
  tenant!: Tenant;
}
