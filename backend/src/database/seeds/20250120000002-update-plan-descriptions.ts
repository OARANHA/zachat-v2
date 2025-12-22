import { QueryInterface } from "sequelize";

/**
 * Atualiza metadata dos planos existentes, se presentes.
 * - Define currency = 'BRL'
 * - Define billingCycle = 'monthly'
 * - Popula description por nome conhecido, ignorando se o plano não existir
 */
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const updates: Array<{ name: string; description: string }> = [
      { name: 'free', description: 'Plano inicial gratuito para teste' },
      { name: 'basic', description: 'Plano para pequenos negócios' },
      { name: 'starter', description: 'Plano inicial para pequenos times' },
      { name: 'pro', description: 'Plano profissional com recursos avançados' },
      { name: 'professional', description: 'Plano profissional com recursos avançados' },
      { name: 'enterprise', description: 'Solução completa para grandes operações' }
    ];

    for (const u of updates) {
      await queryInterface.sequelize.query(
        `UPDATE "Plans" SET "currency" = 'BRL', "billingCycle" = 'monthly', "description" = :description, "updatedAt" = NOW() WHERE lower("name") = :name`,
        { replacements: { name: u.name.toLowerCase(), description: u.description } }
      );
    }
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`UPDATE "Plans" SET "description" = NULL`);
  }
};
