// 20260101000010-add-name-to-tenants.ts
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tenants", "name", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Empresa Padrão"
    });
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tenants", "name");
  }
};
