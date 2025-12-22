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
import ERPProvider from "./ERPProvider";

/**
 * Tipos de eventos webhook
 */
export type WebhookEventType = 'payment' | 'refund' | 'failure' | 'sale' | 'status_update';

/**
 * ERPWebhookLog Model
 * Auditoria e rastreamento de todos os webhooks recebidos dos ERPs
 * Util para debugging e reprocessamento de eventos falhos
 */
@Scopes(() => ({
  byProvider: (providerId: number) => ({
    where: { erpProviderId: providerId }
  }),
  unprocessed: {
    where: { processed: false }
  },
  withProvider: {
    include: [ERPProvider]
  }
}))
@Table({
  tableName: 'ERPWebhookLogs',
  timestamps: true,
  underscored: false,
  paranoid: false,
  indexes: [
    { fields: ['erpProviderId'] },
    { fields: ['processed'] },
    { fields: ['eventType'] },
    { fields: ['externalId'] },
    { fields: ['createdAt'] }
  ]
})
class ERPWebhookLog extends Model<ERPWebhookLog> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => ERPProvider)
  @Column(DataType.INTEGER)
  erpProviderId!: number;

  @BelongsTo(() => ERPProvider)
  erpProvider!: ERPProvider;

  @Validate({ isIn: [['payment', 'refund', 'failure', 'sale', 'status_update']] })
  @Column(DataType.ENUM('payment', 'refund', 'failure', 'sale', 'status_update'))
  eventType!: WebhookEventType;

  @Validate({ notEmpty: true })
  @Column(DataType.TEXT)
  externalId!: string;

  @Column(DataType.JSON)
  payload!: Record<string, any>;

  @Default(false)
  @Column(DataType.BOOLEAN)
  processed!: boolean;

  @AllowNull(true)
  @Column(DataType.TEXT)
  processingError?: string | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  processedAt?: Date | null;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}

export default ERPWebhookLog;
