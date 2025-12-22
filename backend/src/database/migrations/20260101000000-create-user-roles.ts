import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("UserRoles", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Roles", key: "id" },
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
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      assignedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
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

    await queryInterface.addIndex("UserRoles", ["userId", "roleId", "tenantId"], {
      name: "UserRoles_user_role_tenant_unique",
      unique: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("UserRoles", "UserRoles_user_role_tenant_unique").catch(() => {});
    await queryInterface.dropTable("UserRoles").catch(() => {});
  }
};
