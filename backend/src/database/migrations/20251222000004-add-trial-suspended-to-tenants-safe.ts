import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");

    if (!("trialEndsAt" in tableInfo)) {
      await queryInterface.addColumn("Tenants", "trialEndsAt", {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!("suspendedAt" in tableInfo)) {
      await queryInterface.addColumn("Tenants", "suspendedAt", {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");

    if ("suspendedAt" in tableInfo) {
      await queryInterface.removeColumn("Tenants", "suspendedAt");
    }

    if ("trialEndsAt" in tableInfo) {
      await queryInterface.removeColumn("Tenants", "trialEndsAt");
    }
  },
};
