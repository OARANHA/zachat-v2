import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");
    if (!("name" in tableInfo)) {
      await queryInterface.addColumn("Tenants", "name", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Empresa"
      });
    }
  },
  down: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");
    if ("name" in tableInfo) {
      // Apenas remova se foi criada por esta migration
      await queryInterface.removeColumn("Tenants", "name");
    }
  }
};