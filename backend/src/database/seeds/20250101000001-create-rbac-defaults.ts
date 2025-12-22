import { QueryInterface, QueryTypes } from "sequelize";

type TenantRow = { id: number };

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const rows = await queryInterface.sequelize.query<TenantRow>(
      `SELECT id FROM "Tenants" WHERE name = 'Tenant Padrão' OR name = 'Empresa Padrão' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    const tenantId = rows[0]?.id ?? 1;

    // Inserir permissões básicas
    await queryInterface.sequelize.query(`
      INSERT INTO "Permissions" ("name", "description", "module", "action", "resource", "isSystem", "tenantId", "createdAt", "updatedAt") VALUES
      ('user:create', 'Criar usuários', 'users', 'create', 'users', true, ${tenantId}, NOW(), NOW()),
      ('user:read',   'Visualizar usuários', 'users', 'read',   'users', true, ${tenantId}, NOW(), NOW()),
      ('user:update', 'Atualizar usuários',  'users', 'update', 'users', true, ${tenantId}, NOW(), NOW()),
      ('user:delete', 'Excluir usuários',    'users', 'delete', 'users', true, ${tenantId}, NOW(), NOW()),

      ('role:create', 'Criar papéis',        'roles', 'create', 'roles', true, ${tenantId}, NOW(), NOW()),
      ('role:read',   'Visualizar papéis',   'roles', 'read',   'roles', true, ${tenantId}, NOW(), NOW()),
      ('role:update', 'Atualizar papéis',    'roles', 'update', 'roles', true, ${tenantId}, NOW(), NOW()),
      ('role:delete', 'Excluir papéis',      'roles', 'delete', 'roles', true, ${tenantId}, NOW(), NOW()),

      ('ticket:create', 'Criar tickets',      'tickets', 'create', 'tickets', true, ${tenantId}, NOW(), NOW()),
      ('ticket:read',   'Visualizar tickets', 'tickets', 'read',   'tickets', true, ${tenantId}, NOW(), NOW()),
      ('ticket:update', 'Atualizar tickets',  'tickets', 'update', 'tickets', true, ${tenantId}, NOW(), NOW()),
      ('ticket:delete', 'Excluir tickets',    'tickets', 'delete', 'tickets', true, ${tenantId}, NOW(), NOW()),

      ('message:send',   'Enviar mensagens',    'messages', 'send',   'messages', true, ${tenantId}, NOW(), NOW()),
      ('message:read',   'Visualizar mensagens','messages', 'read',   'messages', true, ${tenantId}, NOW(), NOW()),
      ('message:delete', 'Excluir mensagens',   'messages', 'delete', 'messages', true, ${tenantId}, NOW(), NOW()),

      ('whatsapp:create', 'Criar conexões WhatsApp',    'whatsapp', 'create', 'whatsapp', true, ${tenantId}, NOW(), NOW()),
      ('whatsapp:read',   'Visualizar conexões WhatsApp','whatsapp','read',   'whatsapp', true, ${tenantId}, NOW(), NOW()),
      ('whatsapp:update', 'Atualizar conexões WhatsApp','whatsapp','update', 'whatsapp', true, ${tenantId}, NOW(), NOW()),
      ('whatsapp:delete', 'Excluir conexões WhatsApp',  'whatsapp','delete', 'whatsapp', true, ${tenantId}, NOW(), NOW()),

      ('admin:all', 'Acesso administrativo completo', 'admin', 'all', 'admin', true, ${tenantId}, NOW(), NOW())
      ON CONFLICT ("name","tenantId") DO NOTHING
    `);

    // Inserir papéis básicos
    await queryInterface.sequelize.query(`
      INSERT INTO "Roles" ("name", "description", "level", "isSystem", "tenantId", "createdAt", "updatedAt") VALUES
      ('Super Admin', 'Administrador com acesso total ao sistema', 1, true, ${tenantId}, NOW(), NOW()),
      ('Admin',       'Administrador de tenant',                   2, true, ${tenantId}, NOW(), NOW()),
      ('Supervisor',  'Supervisor de atendimento',                 3, true, ${tenantId}, NOW(), NOW()),
      ('Agente',      'Agente de atendimento',                     4, true, ${tenantId}, NOW(), NOW())
      ON CONFLICT ("name", "tenantId") DO NOTHING
    `);

    // Super Admin recebe todas as permissões
    await queryInterface.sequelize.query(`
      INSERT INTO "RolePermissions" ("roleId", "permissionId", "tenantId", "createdAt", "updatedAt")
      SELECT r.id, p.id, ${tenantId}, NOW(), NOW()
      FROM "Roles" r
      CROSS JOIN "Permissions" p
      WHERE r."name" = 'Super Admin' AND r."tenantId" = ${tenantId}
      ON CONFLICT ("roleId", "permissionId") DO NOTHING
    `);

    // Admin recebe a maioria das permissões (exceto algumas críticas)
    await queryInterface.sequelize.query(`
      INSERT INTO "RolePermissions" ("roleId", "permissionId", "tenantId", "createdAt", "updatedAt")
      SELECT r.id, p.id, ${tenantId}, NOW(), NOW()
      FROM "Roles" r
      CROSS JOIN "Permissions" p
      WHERE r."name" = 'Admin' AND r."tenantId" = ${tenantId}
        AND p."name" NOT IN ('admin:all')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING
    `);

    // Supervisor recebe permissões de leitura e update
    await queryInterface.sequelize.query(`
      INSERT INTO "RolePermissions" ("roleId", "permissionId", "tenantId", "createdAt", "updatedAt")
      SELECT r.id, p.id, ${tenantId}, NOW(), NOW()
      FROM "Roles" r
      CROSS JOIN "Permissions" p
      WHERE r."name" = 'Supervisor' AND r."tenantId" = ${tenantId}
        AND p."action" IN ('read', 'update', 'send')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING
    `);

    // Agente recebe permissões básicas de leitura e envio de mensagens
    await queryInterface.sequelize.query(`
      INSERT INTO "RolePermissions" ("roleId", "permissionId", "tenantId", "createdAt", "updatedAt")
      SELECT r.id, p.id, ${tenantId}, NOW(), NOW()
      FROM "Roles" r
      CROSS JOIN "Permissions" p
      WHERE r."name" = 'Agente' AND r."tenantId" = ${tenantId}
        AND p."name" IN ('ticket:read', 'ticket:update', 'message:send', 'message:read', 'whatsapp:read')
      ON CONFLICT ("roleId", "permissionId") DO NOTHING
    `);
  },  // <- vírgula aqui

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`DELETE FROM "RolePermissions"`);
    await queryInterface.sequelize.query(`DELETE FROM "UserRoles"`);
    await queryInterface.sequelize.query(`DELETE FROM "Roles"`);
    await queryInterface.sequelize.query(`DELETE FROM "Permissions"`);
  }
};
