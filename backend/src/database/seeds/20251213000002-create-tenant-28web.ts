import { QueryInterface } from "sequelize";
import bcrypt from "bcryptjs";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 1. Criar Tenant 28web
    const tenant28web = await queryInterface.sequelize.query(`
      INSERT INTO public."Tenants" 
      ("name", status, "ownerId", "businessHours", "messageBusinessHours", "maxUsers", "maxConnections", "createdAt", "updatedAt")
      VALUES 
      ('28web Soluções Digitais', 'active', NULL, 
      '[{"day": 1, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Segunda-Feira"}, 
       {"day": 2, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Terça-Feira"}, 
       {"day": 3, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Quarta-Feira"}, 
       {"day": 4, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Quinta-Feira"}, 
       {"day": 5, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Sexta-Feira"}]', 
      'Deixe seu recado e retornaremos assim que possível. Horário de atendimento: Seg-Sex 08:00-18:00', 
      10, 2, NOW(), NOW())
      RETURNING id;
    `);

    const tenantId = (tenant28web[0] as any)[0].id;

    // 2. Associar ao plano Enterprise
    await queryInterface.sequelize.query(`
      INSERT INTO public."TenantPlans" 
      ("tenantId", "planId", status, "subscriptionId", "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd", "createdAt", "updatedAt")
      VALUES 
      (${tenantId}, 3, 'active', 'enterprise_28web_demo', NOW(), NOW() + INTERVAL '1 month', false, NOW(), NOW());
    `);

    // 3. Criar usuário Admin da 28web
    const hashedPassword = await bcrypt.hash('28web@2024', 10);
    
    await queryInterface.sequelize.query(`
      INSERT INTO public."Users" 
      ("name", email, "passwordHash", "createdAt", "updatedAt", profile, "tokenVersion", "tenantId", "lastLogin", "lastLogout", "isOnline", configs, "lastOnline", status)
      VALUES 
      ('Alessandro Aranha', 'aranhas.com@gmail.com', '${hashedPassword}', NOW(), NOW(), 'admin', 0, ${tenantId}, NULL, NULL, true, 
      '{"filtrosAtendimento":{"searchParam":"","pageNumber":1,"status":["open","pending","closed"],"showAll":true,"count":null,"queuesIds":[],"withUnreadMessages":false,"isNotAssignedUser":false,"includeNotQueueDefined":true},"isDark":false}', 
      NOW(), 'opened')
      RETURNING id;
    `);

    // 4. Criar configurações específicas da 28web
    await queryInterface.sequelize.query(`
      INSERT INTO public."Settings" ("key", value, "createdAt", "updatedAt", "tenantId")
      VALUES 
      ('userCreation', 'enabled', NOW(), NOW(), ${tenantId}),
      ('NotViewTicketsQueueUndefined', 'disabled', NOW(), NOW(), ${tenantId}),
      ('NotViewTicketsChatBot', 'enabled', NOW(), NOW(), ${tenantId}),
      ('DirectTicketsToWallets', 'disabled', NOW(), NOW(), ${tenantId}),
      ('NotViewAssignedTickets', 'disabled', NOW(), NOW(), ${tenantId}),
      ('botTicketActive', '3', NOW(), NOW(), ${tenantId}),
      ('ignoreGroupMsg', 'disabled', NOW(), NOW(), ${tenantId}),
      ('rejectCalls', 'enabled', NOW(), NOW(), ${tenantId}),
      ('callRejectMessage', 'As chamadas de voz e vídeo estão desabilitadas para este WhatsApp, favor enviar uma mensagem de texto.', NOW(), NOW(), ${tenantId}),
      ('hubToken', '28web_demo_token', NOW(), NOW(), ${tenantId}),
      ('companyName', '28web Soluções Digitais', NOW(), NOW(), ${tenantId}),
      ('companyCnpj', '77.018.402/0001-48', NOW(), NOW(), ${tenantId}),
      ('companyPhone', '51990104506', NOW(), NOW(), ${tenantId}),
      ('companyAddress', 'Porto Alegre/RS', NOW(), NOW(), ${tenantId}),
      ('primaryColor', '#000000', NOW(), NOW(), ${tenantId}),
      ('secondaryColor', '#FFA500', NOW(), NOW(), ${tenantId});
    `);

    // 5. Criar filas padrão
    await queryInterface.sequelize.query(`
      INSERT INTO public."Queues" ("name", "color", "greetingMessage", "createdAt", "updatedAt", "tenantId")
      VALUES 
      ('Suporte', '#2196F3', 'Olá! Seja bem-vindo ao suporte 28web. Como podemos ajudar?', NOW(), NOW(), ${tenantId}),
      ('Comercial', '#4CAF50', 'Olá! Seja bem-vindo ao time comercial 28web. Qual sua dúvida sobre nossos planos?', NOW(), NOW(), ${tenantId}),
      ('Financeiro', '#FF9800', 'Olá! Seja bem-vindo ao financeiro 28web. Como podemos ajudar com sua cobrança?', NOW(), NOW(), ${tenantId});
    `);

    // 6. Criar tags padrão
    await queryInterface.sequelize.query(`
      INSERT INTO public."Tags" ("tag", "color", "createdAt", "updatedAt", "tenantId")
      VALUES 
      ('Urgente', '#F44336', NOW(), NOW(), ${tenantId}),
      ('Cliente VIP', '#9C27B0', NOW(), NOW(), ${tenantId}),
      ('Novo Cliente', '#4CAF50', NOW(), NOW(), ${tenantId}),
      ('Follow-up', '#FF9800', NOW(), NOW(), ${tenantId}),
      ('Dúvida', '#2196F3', NOW(), NOW(), ${tenantId});
    `);

    // 7. Criar mensagens rápidas padrão
    await queryInterface.sequelize.query(`
      INSERT INTO public."QuickAnswers" ("title", "message", "createdAt", "updatedAt", "tenantId")
      VALUES 
      ('Boas-vindas', 'Olá! Seja bem-vindo(a) à 28web! 😊 Como posso ajudar?', NOW(), NOW(), ${tenantId}),
      ('Agradecimento', 'Agradecemos seu contato! Se precisar de mais algo, estamos à disposição.', NOW(), NOW(), ${tenantId}),
      ('Encaminhamento', 'Vou transferir seu atendimento para o setor responsável. Um momento, por favor.', NOW(), NOW(), ${tenantId}),
      ('Fora do horário', 'No momento estamos fora do horário comercial. Retornaremos amanhã às 08:00.', NOW(), NOW(), ${tenantId}),
      ('Orçamento', 'Para enviar sua proposta, preciso de algumas informações. Qual seu nome e empresa?', NOW(), NOW(), ${tenantId});
    `);

    console.log(`✅ Tenant 28web criado com sucesso! ID: ${tenantId}`);
    console.log(`📧 Email admin: arahnas.com@gmail.com`);
    console.log(`🔑 Senha temporária: 28web@2024`);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      DELETE FROM public."Tenants" WHERE name = '28web Soluções Digitais';
    `);
  }
};
