import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Default,
  Validate,
  AllowNull,
  Scopes,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";

/**
 * Tipos para status do Tenant
 */
export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'trial';

/**
 * Tenant Model
 * Representa uma empresa cliente da plataforma SaaS
 * Isolamento completo de dados por tenant
 */
@Scopes(() => ({
  active: {
    where: { status: 'active' }
  }
}))
@Table({
  tableName: 'Tenants',
  timestamps: true,
  underscored: false,
  paranoid: false,
  indexes: [
    { fields: ['ownerId'] },
    { fields: ['status'] }
  ]
})
class Tenant extends Model<Tenant> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Validate({ notEmpty: true })
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description?: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  cnpj?: string | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  email?: string | null;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  ownerId?: number;

  @Default('active')
  @Column(DataType.ENUM('active', 'inactive', 'suspended', 'trial'))
  status!: TenantStatus;

  @Default(5)
  @Validate({ isInt: true, min: 1 })
  @Column(DataType.INTEGER)
  maxUsers!: number;

  @Default(1)
  @Validate({ isInt: true, min: 1 })
  @Column(DataType.INTEGER)
  maxConnections!: number;

  @AllowNull(true)
  @Column(DataType.JSONB)
  businessHours?: Record<string, any> | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  messageBusinessHours?: string | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  trialEndsAt?: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  suspendedAt?: Date | null;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  /**
   * Getter: Tenant está em trial?
   */
  get isOnTrial(): boolean {
    return this.status === 'trial' && this.trialEndsAt ? this.trialEndsAt > new Date() : false;
  }

  /**
   * Getter: Tenant está suspenso?
   */
  get isSuspended(): boolean {
    return this.status === 'suspended';
  }

  /**
   * Association: Tenant belongs to Owner (User)
   */
  @BelongsTo(() => User, { foreignKey: 'ownerId', as: 'ownerUser' })
  ownerUser?: User;
}

export default Tenant;
