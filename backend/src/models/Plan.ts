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
  BelongsTo
} from "sequelize-typescript";
import Tenant from "./Tenant";

export interface PlanLimits {
  whatsappSessions: number;
  messagesPerMonth: number;
  storageGB: number;
  users: number;
}

export interface PlanFeatures {
  [key: string]: boolean | string | number;
}

@Table
class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string; // 'starter' | 'professional' | 'enterprise'

  @Column(DataType.DECIMAL(10, 2))
  price: number; // R$/mês

  @Column(DataType.JSONB)
  limits: PlanLimits;

  @Column(DataType.JSONB)
  features: PlanFeatures;

  @Default("active")
  @Column
  status: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

@Table
class TenantPlan extends Model<TenantPlan> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @ForeignKey(() => Plan)
  @Column
  planId: number;

  @BelongsTo(() => Plan)
  plan: Plan;

  @Default("active")
  @Column
  status: string; // 'active' | 'suspended' | 'cancelled'

  @Column
  subscriptionId: string; // ID no gateway de pagamento

  @Column
  currentPeriodStart: Date;

  @Column
  currentPeriodEnd: Date;

  @Column
  cancelAtPeriodEnd: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Plan;
export { TenantPlan };
