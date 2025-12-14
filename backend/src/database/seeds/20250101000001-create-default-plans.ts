import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const plans = [
      {
        name: "starter",
        price: 99.00,
        limits: JSON.stringify({
          whatsappSessions: 1,
          messagesPerMonth: 1000,
          storageGB: 5,
          users: 2
        }),
        features: JSON.stringify({
          whatsapp: true,
          instagram: false,
          telegram: false,
          messenger: false,
          api: false,
          webhooks: false
        }),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "professional",
        price: 399.00,
        limits: JSON.stringify({
          whatsappSessions: 5,
          messagesPerMonth: 10000,
          storageGB: 50,
          users: 10
        }),
        features: JSON.stringify({
          whatsapp: true,
          instagram: true,
          telegram: true,
          messenger: false,
          api: true,
          webhooks: true
        }),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "enterprise",
        price: 999.00,
        limits: JSON.stringify({
          whatsappSessions: 999,
          messagesPerMonth: 100000,
          storageGB: 200,
          users: 50
        }),
        features: JSON.stringify({
          whatsapp: true,
          instagram: true,
          telegram: true,
          messenger: true,
          api: true,
          webhooks: true,
          support: "priority",
          sla: "99.9%"
        }),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert("Plans", plans);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("Plans", {});
  }
};
