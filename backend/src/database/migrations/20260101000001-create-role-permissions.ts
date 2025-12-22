import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("RolePermissions", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Roles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Permissions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      assignedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      grantedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex("RolePermissions", ["roleId", "permissionId", "tenantId"], {
      name: "RolePermissions_role_permission_tenant_unique",
      unique: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("RolePermissions", "RolePermissions_role_permission_tenant_unique").catch(() => {});
    await queryInterface.dropTable("RolePermissions").catch(() => {});
  }
};
