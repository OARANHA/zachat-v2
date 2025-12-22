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
  ForeignKey,
  BelongsTo,
  AllowNull,
  Index,
  Validate,
  Scopes
} from "sequelize-typescript";
import Tenant from "./Tenant";
import Plan from "./Plan";
import ERPProvider from "./ERPProvider";

/**
 * Tipos de status de assinatura
 */
export type SubscriptionStatus = 'pending' | 'active' | 'paused' | 'canceled';

/**
 * Subscription Model
 * Rastreia assinaturas de tenants em planos SaaS
 * Integra com provider ERP para cobrança mensal
 */
@Scopes(() => ({
  active: {
    where: { status: 'active' }
  },
  withRelations: {
    include: [Tenant, Plan, ERPProvider]
  },
  byTenant: (tenantId: number) => ({
    where: { tenantId }
  })
}))
@Table({
  tableName: 'Subscriptions',
  timestamps: true,
  underscored: false,
  paranoid: false,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['planId'] },
    { fields: ['erpProviderId'] },
    { fields: ['status'] },
    { fields: ['tenantId', 'status'] },
    { fields: ['externalInvoiceId'], unique: true }
  ]
})
class Subscription extends Model<Subscription> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Tenant)
  @Column(DataType.INTEGER)
  tenantId!: number;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @ForeignKey(() => Plan)
  @Column(DataType.INTEGER)
  planId!: number;

  @BelongsTo(() => Plan)
  plan!: Plan;

  @ForeignKey(() => ERPProvider)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  erpProviderId?: number | null;

  @BelongsTo(() => ERPProvider)
  erpProvider?: ERPProvider | null;

  @Validate({ notEmpty: true })
  @Column(DataType.TEXT)
  externalInvoiceId!: string;

  @Validate({ isIn: [['pending', 'active', 'paused', 'canceled']] })
  @Default('pending')
  @Column(DataType.ENUM('pending', 'active', 'paused', 'canceled'))
  status!: SubscriptionStatus;

  @Validate({ isDecimal: true })
  @Column(DataType.DECIMAL(10, 2))
  amount!: number;

  @Column(DataType.DATE)
  currentPeriodStart!: Date;

  @Column(DataType.DATE)
  currentPeriodEnd!: Date;

  @Default(true)
  @Column(DataType.BOOLEAN)
  autoRenew!: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  paidAt?: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  canceledAt?: Date | null;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  /**
   * Getter: Quantos dias faltam para renovação?
   */
  get daysUntilRenewal(): number {
    const now = new Date();
    const diffTime = this.currentPeriodEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Getter: Assinatura está vencida?
   */
  get isExpired(): boolean {
    return this.currentPeriodEnd < new Date();
  }
}

export default Subscription;
