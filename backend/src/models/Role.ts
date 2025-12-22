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
import UserRole from './UserRole';
import RolePermission from './RolePermission';

@Table({
  tableName: 'Roles',
  underscored: false,
  timestamps: false,
})
export default class Role extends Model<Role> {
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
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    field: 'description',
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING(20),
    field: 'status',
    defaultValue: 'active',
    allowNull: false,
  })
  status!: 'active' | 'inactive' | 'archived';

  @Column({
    type: DataType.BOOLEAN,
    field: 'isDefault',
    defaultValue: false,
    allowNull: false,
  })
  isDefault!: boolean;

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

  @HasMany(() => UserRole, 'roleId')
  userRoles!: UserRole[];

  @HasMany(() => RolePermission, 'roleId')
  rolePermissions!: RolePermission[];
}
