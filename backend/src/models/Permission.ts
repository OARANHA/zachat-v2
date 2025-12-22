import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import Tenant from './Tenant';
import RolePermission from './RolePermission';

@Table({
  tableName: 'Permissions',
  underscored: false,
  timestamps: false,
})
export default class Permission extends Model<Permission> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.INTEGER,
    field: 'tenantId',
    allowNull: false,
  })
  tenantId!: number;

  @Column({
    type: DataType.STRING(100),
    field: 'name',
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING(200),
    field: 'description',
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING(50),
    field: 'scope',
    defaultValue: 'tenant',
    allowNull: false,
  })
  scope!: 'tenant' | 'global' | 'system';

  @Column({
    type: DataType.STRING(50),
    field: 'status',
    defaultValue: 'active',
    allowNull: false,
  })
  status!: 'active' | 'inactive' | 'deprecated';

  @Column({
    type: DataType.STRING(100),
    field: 'resource',
    allowNull: true,
  })
  resource?: string;

  @Column({
    type: DataType.STRING(100),
    field: 'action',
    allowNull: false,
  })
  action!: string;

  @Column({
    type: DataType.TEXT,
    field: 'conditions',
    allowNull: true,
  })
  conditions?: string;

  @Column({
    type: DataType.JSON,
    field: 'metadata',
    allowNull: true,
  })
  metadata?: Record<string, any> | null;

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
  @BelongsTo(() => Tenant, 'tenantId')
  tenant!: Tenant;

  @HasMany(() => RolePermission, 'permissionId')
  rolePermissions!: RolePermission[];
}
