import { Op } from "sequelize";
import Tenant from "../../models/Tenant";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";

export interface TenantConsumptionData {
  id: number;
  name: string;
  status: string;
  owner: {
    name: string;
    email: string;
  };
  consumption: {
    users: {
      current: number;
      max: number;
      percentage: number;
    };
    connections: {
      current: number;
      max: number;
      percentage: number;
    };
    messages: {
      current: number;
      max: number;
      percentage: number;
    };
  };
  createdAt: Date;
}

const AdminListTenantsWithConsumptionService =
  async (): Promise<TenantConsumptionData[]> => {
    try {
      const tenants = await Tenant.findAll({
        order: [["name", "ASC"]]
      });

      const tenantsWithConsumption = await Promise.all(
        tenants.map(async (tenant) => {
          // Buscar informações do owner se existir
          let ownerInfo = { name: "N/A", email: "N/A" };
          
          if (tenant.ownerId) {
            const owner = await User.findOne({
              where: { id: tenant.ownerId },
              attributes: ["name", "email"]
            });
            
            if (owner) {
              ownerInfo = {
                name: owner.name,
                email: owner.email
              };
            }
          }

          // Contar usuários
          const userCount = await User.count({
            where: {
              tenantId: tenant.id,
              status: "active"
            }
          });

          // Contar conexões
          const connectionCount = await Whatsapp.count({
            where: {
              tenantId: tenant.id,
              isActive: true,
              isDeleted: false
            }
          });

          // Contar mensagens deste mês
          const now = new Date();
          const firstDayOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          );
          const lastDayOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
          );

          const messageCount = await Message.count({
            where: {
              tenantId: tenant.id,
              createdAt: {
                [Op.gte]: firstDayOfMonth,
                [Op.lte]: lastDayOfMonth
              }
            }
          });

          const maxUsers = tenant.maxUsers || 10;
          const maxConnections = tenant.maxConnections || 5;
          const maxMessagesPerMonth = 10000;

          const usersPct = maxUsers > 0 ? Math.round((userCount / maxUsers) * 100) : 0;
          const connPct = maxConnections > 0 ? Math.round((connectionCount / maxConnections) * 100) : 0;
          const msgPct = maxMessagesPerMonth > 0 ? Math.round((messageCount / maxMessagesPerMonth) * 100) : 0;

          return {
            id: tenant.id,
            name: tenant.name,
            status: tenant.status,
            owner: ownerInfo,
            consumption: {
              users: {
                current: userCount,
                max: maxUsers,
                percentage: usersPct
              },
              connections: {
                current: connectionCount,
                max: maxConnections,
                percentage: connPct
              },
              messages: {
                current: messageCount,
                max: maxMessagesPerMonth,
                percentage: msgPct
              }
            },
            createdAt: tenant.createdAt
          };
        })
      );

      return tenantsWithConsumption;
    } catch (error) {
      logger.error(`Erro ao listar tenants com consumo: ${error}`);
      throw error;
    }
  };

export default AdminListTenantsWithConsumptionService;
