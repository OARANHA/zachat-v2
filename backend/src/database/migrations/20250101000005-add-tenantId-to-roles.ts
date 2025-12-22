import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 1) Renomeia coluna legado se existir (tenantid -> tenantId)
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Verifica se a coluna 'tenantid' existe e renomeia para 'tenantId'
        IF EXISTS (
          SELECT 1 
          FROM pg_attribute 
          WHERE attrelid = '"Roles"'::regclass
            AND attname = 'tenantid'
            AND NOT attisdropped
        ) THEN
          ALTER TABLE "Roles" RENAME COLUMN "tenantid" TO "tenantId";
        END IF;
      END; $$
    `);

    // 2) Garante que a coluna 'tenantId' exista, sem erro se já existir
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Verifica se a coluna 'tenantId' já existe antes de criar
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_attribute 
          WHERE attrelid = '"Roles"'::regclass
            AND attname = 'tenantId'
            AND NOT attisdropped
        ) THEN
          ALTER TABLE "Roles" ADD COLUMN "tenantId" INTEGER;
        END IF;
      END; $$
    `);

    // 3) Garante FK apenas se não existir
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Verifica se a constraint de FK já existe
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_constraint 
          WHERE conname = 'roles_tenantId_fkey'
            AND conrelid = '"Roles"'::regclass
        ) THEN
          ALTER TABLE "Roles"
          ADD CONSTRAINT "roles_tenantId_fkey"
            FOREIGN KEY ("tenantId") REFERENCES "Tenants"(id)
            ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
      END; $$
    `);

    // 4) Garante índice (sem erro se já existir)
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS "roles_tenantId_index" ON "Roles"("tenantId");
    `);
  },

  down: async () => {
    // Não realiza nenhuma operação de rollback para evitar quebra de ambientes
    // Caso precise reverter, pode remover a coluna e o índice aqui
  }
};
