import { QueryInterface, QueryTypes } from "sequelize";

type TenantRow = { id: number };

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verifica se já existe um tenant padrão
    const rows = await queryInterface.sequelize.query<TenantRow>(
      `
      SELECT id
      FROM "Tenants"
      WHERE name IN ('Empresa Padrão', 'Tenant Padrão')
      LIMIT 1
      `,
      { type: QueryTypes.SELECT }
    );

    if (rows.length > 0) {
      // Já existe, não insere de novo
      return;
    }

    // Insere o tenant padrão
    return queryInterface.sequelize.query(`
      INSERT INTO "Tenants"
        ("status", "ownerId", "createdAt", "updatedAt", "name", "description",
         "cnpj", "email", "businessHours", "messageBusinessHours", "maxUsers", "maxConnections")
      VALUES
        (
          'active',
          NULL,
          '2021-03-10 17:28:29.000',
          '2021-03-10 17:28:29.000',
          'Empresa Padrão',
          'Tenant criado automaticamente',
          '00.000.000/0000-00',
          'admin@empresa-padrao.com',
          '[{"day": 0, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Domingo"}, {"day": 1, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Segunda-Feira"}, {"day": 2, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Terça-Feira"}, {"day": 3, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Quarta-Feira"}, {"day": 4, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Quinta-Feira"}, {"day": 5, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Sexta-Feira"}, {"day": 6, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Sábado"}]',
          'Olá! Fantástico receber seu contato! No momento estamos ausentes e não poderemos lhe atender, mas vamos priorizar seu atendimento e retornaremos logo mais. Agradecemos muito o contato.',
          10,
          5
        )
    `);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Tenants", {
      name: "Empresa Padrão"
    });
  }
};
