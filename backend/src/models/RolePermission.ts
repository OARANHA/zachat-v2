import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Role from './Role';
import Permission from './Permission';
import Tenant from './Tenant';

@Table({
  tableName: 'RolePermissions',
  underscored: false,
  timestamps: false,
})
export default class RolePermission extends Model<RolePermission> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    field: 'roleId',
    allowNull: false,
  })
  roleId!: number;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.INTEGER,
    field: 'permissionId',
    allowNull: false,
  })
  permissionId!: number;

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
    field: 'grantedAt',
    defaultValue: DataType.NOW,
    allowNull: false,
  })
  grantedAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'expiresAt',
    allowNull: true,
  })
  expiresAt?: Date;

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
  @BelongsTo(() => Role, 'roleId')
  role!: Role;

  @BelongsTo(() => Permission, 'permissionId')
  permission!: Permission;

  @BelongsTo(() => Tenant, 'tenantId')
  tenant!: Tenant;
}
