import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND indexname = 'Settings_key_tenantId_unique'
        ) THEN
          CREATE UNIQUE INDEX "Settings_key_tenantId_unique"
            ON "Settings"("key", "tenantId");
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "Settings_key_tenantId_unique";
    `);
  }
};
