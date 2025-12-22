import { QueryInterface, DataTypes, Sequelize } from "sequelize";

const createPlans = (qi: QueryInterface) => qi.createTable("Plans", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  limits: { type: DataTypes.JSONB, allowNull: false },
  features: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  status: { type: DataTypes.STRING, defaultValue: "active", allowNull: false },
  createdAt: { type: DataTypes.DATE(6), allowNull: false },
  updatedAt: { type: DataTypes.DATE(6), allowNull: false }
});

const createTenantPlans = (qi: QueryInterface) => qi.createTable("TenantPlans", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  tenantId: { type: DataTypes.INTEGER, references: { model: "Tenants", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE", allowNull: false },
  planId: { type: DataTypes.INTEGER, references: { model: "Plans", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT", allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "active", allowNull: false },
  subscriptionId: { type: DataTypes.STRING, allowNull: true },
  currentPeriodStart: { type: DataTypes.DATE, allowNull: false },
  currentPeriodEnd: { type: DataTypes.DATE, allowNull: false },
  cancelAtPeriodEnd: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
  createdAt: { type: DataTypes.DATE(6), allowNull: false },
  updatedAt: { type: DataTypes.DATE(6), allowNull: false }
});

const createERPProviders = (qi: QueryInterface) => qi.createTable("ERPProviders", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  tenantId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Tenants", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  providerType: { type: DataTypes.ENUM('vendaerp', 'bling', 'omie', 'mercadopago'), allowNull: false },
  apiKey: { type: DataTypes.TEXT, allowNull: false },
  webhookSecret: { type: DataTypes.TEXT, allowNull: false },
  webhookUrl: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive', 'error'), allowNull: false, defaultValue: 'inactive' },
  errorMessage: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  lastSync: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  config: { type: DataTypes.JSON, allowNull: true, defaultValue: null },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
});

const createSubscriptions = (qi: QueryInterface) => qi.createTable("Subscriptions", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  tenantId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Tenants", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  planId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Plans", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
  erpProviderId: { type: DataTypes.INTEGER, allowNull: true, references: { model: "ERPProviders", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
  externalInvoiceId: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'active', 'paused', 'canceled'), allowNull: false, defaultValue: 'pending' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currentPeriodStart: { type: DataTypes.DATE, allowNull: false },
  currentPeriodEnd: { type: DataTypes.DATE, allowNull: false },
  autoRenew: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  paidAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  canceledAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
});

const createRoles = (qi: QueryInterface) => qi.createTable("Roles", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  isSystem: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  tenantId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Tenants", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
});

const createPermissions = (qi: QueryInterface) => qi.createTable("Permissions", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  module: { type: DataTypes.STRING(50), allowNull: false },
  action: { type: DataTypes.STRING(50), allowNull: false },
  resource: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
  isSystem: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  tenantId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Tenants", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
});

const createUserRoles = (qi: QueryInterface) => qi.createTable("UserRoles", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  roleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Roles", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  tenantId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Tenants", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  assignedBy: { type: DataTypes.INTEGER, allowNull: true, references: { model: "Users", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
  expiresAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
});

const createRolePermissions = (qi: QueryInterface) => qi.createTable("RolePermissions", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Roles", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  permissionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Permissions", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  tenantId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Tenants", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
  assignedBy: { type: DataTypes.INTEGER, allowNull: true, references: { model: "Users", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
  grantedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  expiresAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
});

const addIndexes = (qi: QueryInterface) => Promise.all([
  qi.addIndex("ERPProviders", ["tenantId"], { name: "idx_erpproviders_tenantid" }),
  qi.addIndex("ERPProviders", ["tenantId", "status"], { name: "idx_erpproviders_tenantid_status" }),
  qi.addIndex("ERPProviders", ["providerType"], { name: "idx_erpproviders_providertype" }),
  qi.addConstraint("ERPProviders", ["tenantId", "providerType"], { type: "unique", name: "uq_erpproviders_tenantid_providertype" }),
  qi.addIndex("Subscriptions", ["tenantId"], { name: "idx_subscriptions_tenantid" }),
  qi.addIndex("Subscriptions", ["planId"], { name: "idx_subscriptions_planid" }),
  qi.addIndex("Subscriptions", ["erpProviderId"], { name: "idx_subscriptions_erpproviderid" }),
  qi.addIndex("Subscriptions", ["status"], { name: "idx_subscriptions_status" }),
  qi.addIndex("Subscriptions", ["tenantId", "status"], { name: "idx_subscriptions_tenantid_status" }),
  qi.addConstraint("Subscriptions", ["externalInvoiceId"], { type: "unique", name: "uq_subscriptions_externalinvoiceid" }),
  qi.addIndex("Roles", ["tenantId"], { name: "idx_roles_tenantid" }),
  qi.addIndex("Roles", ["name"], { name: "idx_roles_name" }),
  qi.addIndex("Roles", ["level"], { name: "idx_roles_level" }),
  qi.addIndex("Roles", ["isSystem"], { name: "idx_roles_issystem" }),
  qi.addConstraint("Roles", ["tenantId", "name"], { type: "unique", name: "uq_roles_tenantid_name" }),
  qi.addIndex("Permissions", ["tenantId"], { name: "idx_permissions_tenantid" }),
  qi.addIndex("Permissions", ["name"], { name: "idx_permissions_name" }),
  qi.addIndex("Permissions", ["module"], { name: "idx_permissions_module" }),
  qi.addIndex("Permissions", ["action"], { name: "idx_permissions_action" }),
  qi.addIndex("Permissions", ["module", "action"], { name: "idx_permissions_module_action" }),
  qi.addIndex("Permissions", ["isSystem"], { name: "idx_permissions_issystem" }),
  qi.addConstraint("Permissions", ["tenantId", "name"], { type: "unique", name: "uq_permissions_tenantid_name" }),
  qi.addIndex("UserRoles", ["userId"], { name: "idx_userroles_userid" }),
  qi.addIndex("UserRoles", ["roleId"], { name: "idx_userroles_roleid" }),
  qi.addIndex("UserRoles", ["tenantId"], { name: "idx_userroles_tenantid" }),
  qi.addIndex("UserRoles", ["userId", "tenantId"], { name: "idx_userroles_userid_tenantid" }),
  qi.addIndex("UserRoles", ["expiresAt"], { name: "idx_userroles_expiresat" }),
  qi.addIndex("UserRoles", ["isDefault"], { name: "idx_userroles_isdefault" }),
  qi.addConstraint("UserRoles", ["userId", "roleId", "tenantId"], { type: "unique", name: "uq_userroles_userid_roleid_tenantid" }),
  qi.addIndex("RolePermissions", ["roleId"], { name: "idx_rolepermissions_roleid" }),
  qi.addIndex("RolePermissions", ["permissionId"], { name: "idx_rolepermissions_permissionid" }),
  qi.addIndex("RolePermissions", ["tenantId"], { name: "idx_rolepermissions_tenantid" }),
  qi.addIndex("RolePermissions", ["roleId", "tenantId"], { name: "idx_rolepermissions_roleid_tenantid" }),
  qi.addIndex("RolePermissions", ["permissionId", "tenantId"], { name: "idx_rolepermissions_permissionid_tenantid" }),
  qi.addIndex("RolePermissions", ["expiresAt"], { name: "idx_rolepermissions_expiresat" }),
  qi.addConstraint("RolePermissions", ["roleId", "permissionId", "tenantId"], { type: "unique", name: "uq_rolepermissions_roleid_permissionid_tenantid" })
]);

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return createPlans(queryInterface)
      .then(() => createTenantPlans(queryInterface))
      .then(() => createERPProviders(queryInterface))
      .then(() => createSubscriptions(queryInterface))
      .then(() => createRoles(queryInterface))
      .then(() => createPermissions(queryInterface))
      .then(() => createUserRoles(queryInterface))
      .then(() => createRolePermissions(queryInterface))
      .then(() => addIndexes(queryInterface));
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("RolePermissions")
      .then(() => queryInterface.dropTable("UserRoles"))
      .then(() => queryInterface.dropTable("Permissions"))
      .then(() => queryInterface.dropTable("Roles"))
      .then(() => queryInterface.dropTable("Subscriptions"))
      .then(() => queryInterface.dropTable("ERPProviders"))
      .then(() => queryInterface.dropTable("TenantPlans"))
      .then(() => queryInterface.dropTable("Plans"));
  }
};
