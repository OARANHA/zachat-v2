/**
 * Plan Model - Modelo de planos de assinatura
 * 
 * © 2024 28web. Todos os direitos reservados.
 */

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
  HasMany,
  ForeignKey,
  BelongsTo,
  Index,
  Validate,
  Scopes
} from "sequelize-typescript";
import Tenant from "./Tenant";

/**
 * Interface para limites de plano
 */
export interface PlanLimits {
  // Novo formato padronizado
  messagesPerMonth: number;
  storageGB: number;
  users: number;
  whatsappSessions: number;
  // Campos legados (compatibilidade)
  whatsapp_accounts?: number;
  messages_per_month?: number;
  contacts?: number;
}

/**
 * Interface para features de plano
 */
export interface PlanFeatures {
  [key: string]: boolean | string | number;
}

/**
 * Tipos de status de plano
 */
export type PlanStatus = 'active' | 'inactive' | 'archived';

/**
 * Plan Model
 * Planos de assinatura SaaS disponíveis para todos os tenants
 */
@Scopes(() => ({
  active: {
    where: { status: 'active' }
  }
}))
@Table({
  tableName: 'Plans',
  timestamps: true,
  underscored: false,
  paranoid: false,
  indexes: [
    { fields: ['status'] }
  ]
})
class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Validate({ notEmpty: true })
  @Column(DataType.STRING)
  name!: string;

  @Validate({ isDecimal: true })
  @Column(DataType.DECIMAL(10, 2))
  price!: number;

  @Column(DataType.JSONB)
  limits!: PlanLimits;

  @Column(DataType.JSONB)
  features!: PlanFeatures;

  @Default('BRL')
  @Column(DataType.STRING(3))
  currency!: string;

  @Column(DataType.TEXT)
  description?: string | null;

  @Default('monthly')
  @Column(DataType.STRING(20))
  billingCycle!: string;

  @Default('active')
  @Column(DataType.ENUM('active', 'inactive', 'archived'))
  status!: PlanStatus;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}

/**
 * TenantPlan Model
 * Rastreia qual plano cada tenant está usando
 * Relaciona tenant com plano + dados de assinatura
 */
@Table({
  tableName: 'TenantPlans',
  timestamps: true,
  underscored: false,
  paranoid: false,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['planId'] },
    { fields: ['status'] }
  ]
})
class TenantPlan extends Model<TenantPlan> {
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

  @Default('active')
  @Column(DataType.ENUM('active', 'suspended', 'cancelled'))
  status!: 'active' | 'suspended' | 'cancelled';

  @Validate({ notEmpty: true })
  @Column(DataType.STRING)
  subscriptionId!: string;

  @Column(DataType.DATE)
  currentPeriodStart!: Date;

  @Column(DataType.DATE)
  currentPeriodEnd!: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  cancelAtPeriodEnd!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}

export default Plan;
export { TenantPlan };
