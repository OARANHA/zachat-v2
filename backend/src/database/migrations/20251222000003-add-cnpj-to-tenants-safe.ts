import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");

    if (!("cnpj" in tableInfo)) {
      await queryInterface.addColumn("Tenants", "cnpj", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");

    if ("cnpj" in tableInfo) {
      await queryInterface.removeColumn("Tenants", "cnpj");
    }
  },
};
