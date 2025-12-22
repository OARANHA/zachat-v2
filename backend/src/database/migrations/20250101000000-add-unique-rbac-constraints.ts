'use strict';

module.exports = {
  up: async (queryInterface: any) => {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE c.conname = 'roles_name_tenant_unique'
            AND t.relname = 'Roles'
        ) THEN
          ALTER TABLE "Roles"
          ADD CONSTRAINT roles_name_tenant_unique UNIQUE ("name","tenantId");
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE c.conname = 'permissions_name_tenant_unique'
            AND t.relname = 'Permissions'
        ) THEN
          ALTER TABLE "Permissions"
          ADD CONSTRAINT permissions_name_tenant_unique UNIQUE ("name","tenantId");
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          WHERE c.conname = 'role_permissions_unique'
            AND t.relname = 'RolePermissions'
        ) THEN
          ALTER TABLE "RolePermissions"
          ADD CONSTRAINT role_permissions_unique UNIQUE ("roleId","permissionId");
        END IF;
      END
      $$;
    `);
  },

  down: async (queryInterface: any) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "RolePermissions"
      DROP CONSTRAINT IF EXISTS role_permissions_unique;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Permissions"
      DROP CONSTRAINT IF EXISTS permissions_name_tenant_unique;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Roles"
      DROP CONSTRAINT IF EXISTS roles_name_tenant_unique;
    `);
  }
};
