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
  BeforeCreate,
  BeforeUpdate,
  Scopes
} from "sequelize-typescript";
import Tenant from "./Tenant";

/**
 * Tipos de provider ERP suportados
 */
export type ERPProviderType = 'vendaerp' | 'bling' | 'omie' | 'mercadopago';
export type ERPProviderStatus = 'active' | 'inactive' | 'error';

/**
 * ERPProvider Model
 * Configuração de integração com ERPs externos
 * Permite cada tenant usar um ERP diferente para cobrança
 */
@Scopes(() => ({
  active: {
    where: { status: 'active' }
  },
  withTenant: {
    include: [Tenant]
  }
}))
@Table({
  tableName: 'ERPProviders',
  timestamps: true,
  underscored: false,
  paranoid: false,
  indexes: [
    { fields: ['tenantId'] },
    { fields: ['tenantId', 'status'] }
  ]
})
class ERPProvider extends Model<ERPProvider, ERPProvider> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Tenant)
  @Column({
    field: 'tenantId',
    type: DataType.INTEGER
  })
  tenantId!: number;

  @BelongsTo(() => Tenant)
  tenant!: Tenant;

  @Validate({ isIn: [['vendaerp', 'bling', 'omie', 'mercadopago']] })
  @Column(DataType.ENUM('vendaerp', 'bling', 'omie', 'mercadopago'))
  providerType!: ERPProviderType;

  @Validate({ notEmpty: true })
  @Column(DataType.TEXT)
  apiKey!: string;

  @Validate({ notEmpty: true })
  @Column(DataType.TEXT)
  webhookSecret!: string;

  @Validate({ isUrl: true })
  @Column(DataType.STRING)
  webhookUrl!: string;

  @Default('inactive')
  @Column(DataType.ENUM('active', 'inactive', 'error'))
  status!: ERPProviderStatus;

  @AllowNull(true)
  @Column(DataType.TEXT)
  errorMessage?: string | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  lastSync?: Date | null;

  @AllowNull(true)
  @Column(DataType.JSON)
  config?: Record<string, any> | null;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  /**
   * Getter: Provider está ativo e pronto para usar?
   */
  get isActive(): boolean {
    return this.status === 'active' && !this.errorMessage;
  }
}

export default ERPProvider
