import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Plans", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
        },
        limits: {
          type: DataTypes.JSONB,
          allowNull: false
        },
        features: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {}
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: "active",
          allowNull: false
        },
        createdAt: {
          type: DataTypes.DATE(6),
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE(6),
          allowNull: false
        }
      })
      .then(() => {
        // Tabela de Assinaturas de Tenant (criada após Plans para evitar erro de FK)
        return queryInterface.createTable("TenantPlans", {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
          },
          tenantId: {
            type: DataTypes.INTEGER,
            references: { model: "Tenants", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false
          },
          planId: {
            type: DataTypes.INTEGER,
            references: { model: "Plans", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
            allowNull: false
          },
          status: {
            type: DataTypes.STRING,
            defaultValue: "active",
            allowNull: false
          },
          subscriptionId: {
            type: DataTypes.STRING,
            allowNull: true
          },
          currentPeriodStart: {
            type: DataTypes.DATE,
            allowNull: false
          },
          currentPeriodEnd: {
            type: DataTypes.DATE,
            allowNull: false
          },
          cancelAtPeriodEnd: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
          },
          createdAt: {
            type: DataTypes.DATE(6),
            allowNull: false
          },
          updatedAt: {
            type: DataTypes.DATE(6),
            allowNull: false
          }
        });
      });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("TenantPlans")
      .then(() => {
        return queryInterface.dropTable("Plans");
      });
  }
};
