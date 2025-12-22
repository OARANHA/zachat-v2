import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("ErpProviders", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      providerType: {
        type: DataTypes.ENUM('vendaerp', 'bling', 'omie', 'mercadopago'),
        allowNull: false
      },
      apiKey: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      webhookSecret: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      webhookUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'error'),
        allowNull: false,
        defaultValue: 'inactive'
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      lastSync: {
        type: DataTypes.DATE,
        allowNull: true
      },
      config: {
        type: DataTypes.JSON,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Adicionar indexes para performance
    await queryInterface.addIndex("ErpProviders", ["tenantId"], {
      name: "erp_providers_tenant_id_index"
    });

    await queryInterface.addIndex("ErpProviders", ["tenantId", "status"], {
      name: "erp_providers_tenant_status_index"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("ErpProviders", "erp_providers_tenant_status_index");
    await queryInterface.removeIndex("ErpProviders", "erp_providers_tenant_id_index");
    await queryInterface.dropTable("ErpProviders");
  }
};
