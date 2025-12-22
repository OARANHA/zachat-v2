import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM "Tenants" WHERE name = 'Empresa Padrão' LIMIT 1`
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return;
    }

    await queryInterface.sequelize.query(`
      INSERT INTO "Tenants"
        ("status", "ownerId", "createdAt", "updatedAt", "name", "description",
         "cnpj", "email", "businessHours", "messageBusinessHours", "maxUsers", "maxConnections")
      VALUES
        (
          'active',
          NULL,
          NOW(),
          NOW(),
          'Empresa Padrão',
          'Tenant criado automaticamente pelo seed',
          '00.000.000/0000-00',
          'admin@empresa-padrao.com',
          '[]',
          'Olá! Fantástico receber seu contato! No momento estamos ausentes e não poderemos lhe atender, mas vamos priorizar seu atendimento e retornaremos logo mais. Agradecemos muito o contato.',
          10,
          5
        )
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      `DELETE FROM "Tenants" WHERE name = 'Empresa Padrão'`
    );
  }
};
