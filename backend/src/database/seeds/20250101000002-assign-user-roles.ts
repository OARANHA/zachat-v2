import { QueryInterface, QueryTypes } from "sequelize";

type TenantRow = { id: number };

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const rows = await queryInterface.sequelize.query<TenantRow>(
      `SELECT id FROM "Tenants" WHERE name = 'Tenant Padrão' OR name = 'Empresa Padrão' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    const tenantId = rows[0]?.id ?? 1;

    // 2) Usar o tenantId resolvido para montar as associações em "UserRoles"
    await queryInterface.sequelize.query(`
      INSERT INTO "UserRoles" ("userId", "roleId", "tenantId", "createdAt", "updatedAt", "isDefault") VALUES
      -- Super Admin (admin@superadmin.com) -> Super Admin
      (
        (SELECT id FROM "Users" WHERE email = 'admin@superadmin.com' LIMIT 1),
        (SELECT id FROM "Roles" WHERE name = 'Super Admin' AND "tenantId" = ${tenantId} LIMIT 1),
        ${tenantId}, NOW(), NOW(), true
      ),
      -- Aranha (aranha.com@gmail.com) -> Super Admin
      (
        (SELECT id FROM "Users" WHERE email = 'aranha.com@gmail.com' LIMIT 1),
        (SELECT id FROM "Roles" WHERE name = 'Super Admin' AND "tenantId" = ${tenantId} LIMIT 1),
        ${tenantId}, NOW(), NOW(), true
      ),
      -- Administrador (admin@empresa-padrao.com) -> Admin
      (
        (SELECT id FROM "Users" WHERE email = 'admin@empresa-padrao.com' LIMIT 1),
        (SELECT id FROM "Roles" WHERE name = 'Admin' AND "tenantId" = ${tenantId} LIMIT 1),
        ${tenantId}, NOW(), NOW(), true
      ),
      -- Usuário Teste (user@empresa-padrao.com) -> Agente
      (
        (SELECT id FROM "Users" WHERE email = 'user@empresa-padrao.com' LIMIT 1),
        (SELECT id FROM "Roles" WHERE name = 'Agente' AND "tenantId" = ${tenantId} LIMIT 1),
        ${tenantId}, NOW(), NOW(), true
      )
      ON CONFLICT ("userId", "roleId", "tenantId") DO NOTHING
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      DELETE FROM "UserRoles"
      WHERE "userId" IN (
        SELECT id FROM "Users" WHERE email IN (
          'admin@superadmin.com',
          'aranha.com@gmail.com',
          'admin@empresa-padrao.com',
          'user@empresa-padrao.com'
        )
      );
    `);
  }
};
