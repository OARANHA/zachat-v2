import { QueryInterface, QueryTypes } from "sequelize";

type CountRow = { count: string };
type IdRow = { id: number; name?: string; tenantId?: number };

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar se já existem planos para evitar duplicação
    const existingPlans = await queryInterface.sequelize.query<CountRow>(
      `SELECT COUNT(*) as count FROM "Plans"`,
      { type: QueryTypes.SELECT }
    );
    const planCount = parseInt(existingPlans[0]?.count ?? "0", 10);

    if (planCount === 0) {
      await queryInterface.bulkInsert("Plans", [
        {
          name: "Starter",
          price: 29.9,
          limits: {
            whatsapp_accounts: 2,
            messages_per_month: 1000,
            contacts: 500,
            users: 1
          },
          features: {
            whatsapp_integration: true,
            basic_analytics: true,
            auto_replies: true,
            custom_fields: false
          },
          currency: "BRL",
          description: "Plano ideal para pequenos negócios",
          billingCycle: "monthly", // CamelCase alinhado à migration
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Professional",
          price: 79.9,
          limits: {
            whatsapp_accounts: 5,
            messages_per_month: 5000,
            contacts: 2500,
            users: 3
          },
          features: {
            whatsapp_integration: true,
            advanced_analytics: true,
            auto_replies: true,
            custom_fields: true,
            integrations: true,
            api_access: true
          },
          currency: "BRL",
          description: "Plano completo para empresas em crescimento",
          billingCycle: "monthly",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Enterprise",
          price: 199.9,
          limits: {
            whatsapp_accounts: 15,
            messages_per_month: 15000,
            contacts: 10000,
            users: 10
          },
          features: {
            whatsapp_integration: true,
            advanced_analytics: true,
            auto_replies: true,
            custom_fields: true,
            integrations: true,
            api_access: true,
            priority_support: true,
            white_label: true
          },
          currency: "BRL",
          description: "Solução empresarial com recursos ilimitados",
          billingCycle: "monthly",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } else {
      console.log(`Pulando inserção de Plans: já existem ${planCount} planos na tabela.`);
    }

    // Obter tenants (até 4)
    const tenants = await queryInterface.sequelize.query<IdRow>(
      `SELECT id FROM "Tenants" LIMIT 4`,
      { type: QueryTypes.SELECT }
    );

    if (!tenants || tenants.length === 0) {
      console.log("Nenhum tenant encontrado. Pulando inserção de dados de billing.");
      return;
    }

    // Verificar ERPProviders
    const existingERPProviders = await queryInterface.sequelize.query<CountRow>(
      `SELECT COUNT(*) as count FROM "ERPProviders"`,
      { type: QueryTypes.SELECT }
    );
    const erpProviderCount = parseInt(existingERPProviders[0]?.count ?? "0", 10);

    if (erpProviderCount === 0) {
      const erpProvidersBase = [
        { tenantIdx: 0, providerType: "vendaerp",    apiKey: "vendaerp_api_key_tenant_1", webhookSecret: "webhook_secret_1", webhookUrl: "https://tenant1.example.com/webhook", status: "active" },
        { tenantIdx: 1, providerType: "bling",       apiKey: "bling_api_key_tenant_2",    webhookSecret: "webhook_secret_2", webhookUrl: "https://tenant2.example.com/webhook", status: "active" },
        { tenantIdx: 2, providerType: "omie",        apiKey: "omie_api_key_tenant_3",     webhookSecret: "webhook_secret_3", webhookUrl: "https://tenant3.example.com/webhook", status: "inactive" },
        { tenantIdx: 3, providerType: "mercadopago", apiKey: "mp_api_key_tenant_4",       webhookSecret: "webhook_secret_4", webhookUrl: "https://tenant4.example.com/webhook", status: "active" }
      ];
    
      const erpProviders = erpProvidersBase
        // só usa se o tenant desse índice existir
        .filter(p => tenants[p.tenantIdx])
        .map(p => ({
          tenantId: tenants[p.tenantIdx].id,
          providerType: p.providerType,
          apiKey: p.apiKey,
          webhookSecret: p.webhookSecret,
          webhookUrl: p.webhookUrl,
          status: p.status,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
    
      if (erpProviders.length > 0) {
        await queryInterface.bulkInsert("ERPProviders", erpProviders);
        console.log("ERPProviders inseridos com sucesso.");
      } else {
        console.log("Nenhum ERPProvider inserido (nenhum tenant correspondente encontrado).");
      }
    }

    // Obter IDs de Plans e ERPProviders
    const plans = await queryInterface.sequelize.query<IdRow>(
      `SELECT id, name FROM "Plans"`,
      { type: QueryTypes.SELECT }
    );

    const erpProvidersResult = await queryInterface.sequelize.query<IdRow>(
      `SELECT id, "tenantId" FROM "ERPProviders"`,
      { type: QueryTypes.SELECT }
    );

    const planIds: Record<string, number> = {};
    plans.forEach(p => {
      if (p.name) planIds[p.name] = p.id;
    });

    const erpProviderIds: Record<number, number> = {};
    erpProvidersResult.forEach(p => {
      if (typeof p.tenantId === "number") {
        erpProviderIds[p.tenantId] = p.id;
      }
    });

    // TenantPlans
    const existingTenantPlans = await queryInterface.sequelize.query<CountRow>(
      `SELECT COUNT(*) as count FROM "TenantPlans"`,
      { type: QueryTypes.SELECT }
    );
    const tenantPlanCount = parseInt(existingTenantPlans[0]?.count ?? "0", 10);

    if (tenantPlanCount === 0 && plans.length > 0) {
      const baseDateStart = new Date("2025-12-01");
      const baseDateEnd = new Date("2025-12-31");

      const tenantPlans = [
        { tenantIdx: 0, planName: "Starter" },
        { tenantIdx: 1, planName: "Professional" },
        { tenantIdx: 2, planName: "Enterprise" },
        { tenantIdx: 3, planName: "Starter" }
      ]
        .filter(p => tenants[p.tenantIdx] && planIds[p.planName])
        .map(p => ({
          tenantId: tenants[p.tenantIdx].id,
          planId: planIds[p.planName],
          status: "active",
          currentPeriodStart: baseDateStart,
          currentPeriodEnd: baseDateEnd,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

      if (tenantPlans.length > 0) {
        await queryInterface.bulkInsert("TenantPlans", tenantPlans);
        console.log("TenantPlans inseridos com sucesso.");
      }
    } else {
      console.log(`Pulando inserção de TenantPlans: já existem ${tenantPlanCount} TenantPlans na tabela.`);
    }

    // Subscriptions
    const existingSubscriptions = await queryInterface.sequelize.query<CountRow>(
      `SELECT COUNT(*) as count FROM "Subscriptions"`,
      { type: QueryTypes.SELECT }
    );
    const subscriptionCount = parseInt(existingSubscriptions[0]?.count ?? "0", 10);

    if (subscriptionCount === 0 && plans.length > 0 && erpProvidersResult.length > 0) {
      const baseDateStart = new Date("2025-12-01");
      const baseDateEnd = new Date("2025-12-31");

      const subsBase = [
        { tenantIdx: 0, planName: "Starter",      invoice: "INV-2025-001", amount: 29.9 },
        { tenantIdx: 1, planName: "Professional", invoice: "INV-2025-002", amount: 79.9 },
        { tenantIdx: 2, planName: "Enterprise",   invoice: "INV-2025-003", amount: 199.9 },
        { tenantIdx: 3, planName: "Starter",      invoice: "INV-2025-004", amount: 29.9 }
      ];

      const subscriptions = subsBase
        .filter(s => tenants[s.tenantIdx] && planIds[s.planName])
        .map(s => {
          const tenantId = tenants[s.tenantIdx].id;
          const erpProviderId = erpProviderIds[tenantId] ?? erpProviderIds[tenants[s.tenantIdx]?.id || 0];

          return {
            tenantId,
            planId: planIds[s.planName],
            erpProviderId,
            externalInvoiceId: s.invoice,
            status: "active",
            amount: s.amount,
            currentPeriodStart: baseDateStart,
            currentPeriodEnd: baseDateEnd,
            autoRenew: true,
            paidAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
        })
        .filter(s => s.erpProviderId); // garante que tem ERPProviders

      if (subscriptions.length > 0) {
        await queryInterface.bulkInsert("Subscriptions", subscriptions);
        console.log("Subscriptions inseridas com sucesso.");
      }
    } else {
      console.log(`Pulando inserção de Subscriptions: já existem ${subscriptionCount} Subscriptions na tabela.`);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("Subscriptions", {}, {});
    await queryInterface.bulkDelete("TenantPlans", {}, {});
    await queryInterface.bulkDelete("ERPProviders", {}, {});
    await queryInterface.bulkDelete("Plans", {}, {});
  }
};
