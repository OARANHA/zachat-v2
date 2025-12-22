'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Iniciando padronização de colunas RBAC...');

      // ═══════════════════════════════════════════════════════════════
      // PARTE 1: Renomear colunas de RolePermissions
      // ═══════════════════════════════════════════════════════════════

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rolepermissions' AND column_name = 'roleid'
          ) THEN
            ALTER TABLE "RolePermissions" RENAME COLUMN "roleid" TO "roleId";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rolepermissions' AND column_name = 'permissionid'
          ) THEN
            ALTER TABLE "RolePermissions" RENAME COLUMN "permissionid" TO "permissionId";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rolepermissions' AND column_name = 'tenantid'
          ) THEN
            ALTER TABLE "RolePermissions" RENAME COLUMN "tenantid" TO "tenantId";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rolepermissions' AND column_name = 'assignedby'
          ) THEN
            ALTER TABLE "RolePermissions" RENAME COLUMN "assignedby" TO "assignedBy";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rolepermissions' AND column_name = 'grantedat'
          ) THEN
            ALTER TABLE "RolePermissions" RENAME COLUMN "grantedat" TO "grantedAt";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rolepermissions' AND column_name = 'expiresat'
          ) THEN
            ALTER TABLE "RolePermissions" RENAME COLUMN "expiresat" TO "expiresAt";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rolepermissions' AND column_name = 'createdat'
          ) THEN
            ALTER TABLE "RolePermissions" RENAME COLUMN "createdat" TO "createdAt";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rolepermissions' AND column_name = 'updatedat'
          ) THEN
            ALTER TABLE "RolePermissions" RENAME COLUMN "updatedat" TO "updatedAt";
          END IF;
        END $$;`,
        { transaction }
      );

      console.log('✅ RolePermissions padronizado!');

      // ═══════════════════════════════════════════════════════════════
      // PARTE 2: Renomear colunas de UserRoles
      // ═══════════════════════════════════════════════════════════════

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'userroles' AND column_name = 'userid'
          ) THEN
            ALTER TABLE "UserRoles" RENAME COLUMN "userid" TO "userId";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'userroles' AND column_name = 'roleid'
          ) THEN
            ALTER TABLE "UserRoles" RENAME COLUMN "roleid" TO "roleId";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'userroles' AND column_name = 'tenantid'
          ) THEN
            ALTER TABLE "UserRoles" RENAME COLUMN "tenantid" TO "tenantId";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'userroles' AND column_name = 'assignedby'
          ) THEN
            ALTER TABLE "UserRoles" RENAME COLUMN "assignedby" TO "assignedBy";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'userroles' AND column_name = 'expiresat'
          ) THEN
            ALTER TABLE "UserRoles" RENAME COLUMN "expiresat" TO "expiresAt";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'userroles' AND column_name = 'isdefault'
          ) THEN
            ALTER TABLE "UserRoles" RENAME COLUMN "isdefault" TO "isDefault";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'userroles' AND column_name = 'createdat'
          ) THEN
            ALTER TABLE "UserRoles" RENAME COLUMN "createdat" TO "createdAt";
          END IF;
        END $$;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'userroles' AND column_name = 'updatedat'
          ) THEN
            ALTER TABLE "UserRoles" RENAME COLUMN "updatedat" TO "updatedAt";
          END IF;
        END $$;`,
        { transaction }
      );

      console.log('✅ UserRoles padronizado!');

      await transaction.commit();
      console.log('✅✅ Todas as colunas padronizadas com sucesso!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erro na migration:', error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('⏮️ Revertendo padronização...');

      // Reverter RolePermissions
      await queryInterface.sequelize.query(
        `ALTER TABLE "RolePermissions" RENAME COLUMN "roleId" TO "roleid"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "RolePermissions" RENAME COLUMN "permissionId" TO "permissionid"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "RolePermissions" RENAME COLUMN "tenantId" TO "tenantid"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "RolePermissions" RENAME COLUMN "assignedBy" TO "assignedby"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "RolePermissions" RENAME COLUMN "grantedAt" TO "grantedat"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "RolePermissions" RENAME COLUMN "expiresAt" TO "expiresat"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "RolePermissions" RENAME COLUMN "createdAt" TO "createdat"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "RolePermissions" RENAME COLUMN "updatedAt" TO "updatedat"`,
        { transaction }
      );

      // Reverter UserRoles
      await queryInterface.sequelize.query(
        `ALTER TABLE "UserRoles" RENAME COLUMN "userId" TO "userid"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "UserRoles" RENAME COLUMN "roleId" TO "roleid"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "UserRoles" RENAME COLUMN "tenantId" TO "tenantid"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "UserRoles" RENAME COLUMN "assignedBy" TO "assignedby"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "UserRoles" RENAME COLUMN "expiresAt" TO "expiresat"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "UserRoles" RENAME COLUMN "isDefault" TO "isdefault"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "UserRoles" RENAME COLUMN "createdAt" TO "createdat"`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "UserRoles" RENAME COLUMN "updatedAt" TO "updatedat"`,
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Reversão bem-sucedida!');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
