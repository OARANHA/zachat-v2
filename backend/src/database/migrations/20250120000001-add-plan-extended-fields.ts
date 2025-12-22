import { QueryInterface, DataTypes, Sequelize } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    // helper para checar coluna
    const columnExists = async (column: string) => {
      const [results] = await queryInterface.sequelize.query(
        `
        SELECT column_name 
        FROM information_schema.columns
        WHERE table_name = 'Plans' AND column_name = :column
        `,
        { replacements: { column } }
      );
      return (results as any[]).length > 0;
    };

    // currency
    if (!(await columnExists("currency"))) {
      await queryInterface.addColumn("Plans", "currency", {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "BRL"
      });
    }

    // description
    if (!(await columnExists("description"))) {
      await queryInterface.addColumn("Plans", "description", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      });
    }

    // billingCycle (camelCase padronizado)
    if (!(await columnExists("billingCycle"))) {
      await queryInterface.addColumn("Plans", "billingCycle", {
        type: DataTypes.ENUM("monthly", "quarterly", "yearly"),
        allowNull: false,
        defaultValue: "monthly"
      });
    }
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.removeColumn("Plans", "billingCycle").catch(() => {});
    await queryInterface.removeColumn("Plans", "description").catch(() => {});
    await queryInterface.removeColumn("Plans", "currency").catch(() => {});
    // opcional: dropar o ENUM se ele tiver sido criado por esta migration
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Plans_billingCycle";');
  }
};
