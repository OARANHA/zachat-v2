import Tenant from "../../models/Tenant";
import User from "../../models/User";

interface AdminTenantResponse {
  id: number;
  name: string;
  description?: string | null;
  cnpj?: string | null;
  email?: string | null;
  status: "active" | "inactive" | "suspended" | "trial";
  maxUsers: number;
  maxConnections: number;
  owner: {
    id: number;
    name: string;
    email: string;
  } | null;
  createdAt: Date;
}

const AdminListTenantsService = async (): Promise<AdminTenantResponse[]> => {
  const tenants = await Tenant.findAll({
    include: [
      {
        model: User,
        as: "ownerUser",
        attributes: ["id", "name", "email"],
        required: false
      }
    ],
    order: [["name", "ASC"]]
  });

  return tenants.map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    description: tenant.description,
    cnpj: tenant.cnpj,
    email: tenant.email,
    status: tenant.status,
    maxUsers: tenant.maxUsers,
    maxConnections: tenant.maxConnections,
    owner: tenant.ownerUser
      ? {
          id: tenant.ownerUser.id,
          name: tenant.ownerUser.name,
          email: tenant.ownerUser.email
        }
      : null,
    createdAt: tenant.createdAt
  }));
};

export default AdminListTenantsService;
