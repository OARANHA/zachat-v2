import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");

    if (!("description" in tableInfo)) {
      await queryInterface.addColumn("Tenants", "description", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");

    if ("description" in tableInfo) {
      await queryInterface.removeColumn("Tenants", "description");
    }
  }
};
