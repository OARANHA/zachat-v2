import { QueryInterface, DataTypes } from "sequelize";

const createPlans = (qi: QueryInterface) =>
  qi.createTable("Plans", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    limits: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

const createTenantPlans = (qi: QueryInterface) =>
  qi.createTable("TenantPlans", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      references: { model: "Tenants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    planId: {
      type: DataTypes.INTEGER,
      references: { model: "Plans", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'trial'),
      defaultValue: 'active'
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: true
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

const createRoles = (qi: QueryInterface) =>
  qi.createTable("roles", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      references: { model: "Tenants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

const createPermissions = (qi: QueryInterface) =>
  qi.createTable("permissions", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    module: {
      type: DataTypes.STRING,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      references: { model: "Tenants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

const createUserRoles = (qi: QueryInterface) =>
  qi.createTable("user_roles", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: { model: "roles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      references: { model: "Tenants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

const createRolePermissions = (qi: QueryInterface) =>
  qi.createTable("role_permissions", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: { model: "roles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    permissionId: {
      type: DataTypes.INTEGER,
      references: { model: "permissions", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    tenantId: {
      type: DataTypes.INTEGER,
      references: { model: "Tenants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    grantedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

const addIndexes = (qi: QueryInterface) =>
  Promise.all([
    qi.addIndex("TenantPlans", ["tenantId"]),
    qi.addIndex("TenantPlans", ["planId"]),
    qi.addIndex("roles", ["tenantId"]),
    qi.addIndex("permissions", ["tenantId"]),
    qi.addIndex("user_roles", ["userId"]),
    qi.addIndex("user_roles", ["roleId"]),
    qi.addIndex("user_roles", ["tenantId"]),
    qi.addIndex("role_permissions", ["roleId"]),
    qi.addIndex("role_permissions", ["permissionId"]),
    qi.addIndex("role_permissions", ["tenantId"])
  ]);

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return createPlans(queryInterface)
      .then(() => createTenantPlans(queryInterface))
      .then(() => createRoles(queryInterface))
      .then(() => createPermissions(queryInterface))
      .then(() => createUserRoles(queryInterface))
      .then(() => createRolePermissions(queryInterface))
      .then(() => addIndexes(queryInterface));
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface
      .dropTable("role_permissions", { cascade: true })
      .then(() => queryInterface.dropTable("user_roles", { cascade: true }))
      .then(() => queryInterface.dropTable("permissions", { cascade: true }))
      .then(() => queryInterface.dropTable("roles", { cascade: true }))
      .then(() => queryInterface.dropTable("TenantPlans", { cascade: true }))
      .then(() => queryInterface.dropTable("Plans", { cascade: true }));
  }
};
