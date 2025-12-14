import express from "express";
import * as AdminController from "../controllers/AdminController";
import isAuthAdmin from "../middleware/isAuthAdmin";

const adminRoutes = express.Router();

adminRoutes.get("/users", isAuthAdmin, AdminController.indexUsers);
adminRoutes.put(
  "/users/:userId",
  isAuthAdmin,
  AdminController.updateUser
);

adminRoutes.get("/tenants", isAuthAdmin, AdminController.indexTenants);
adminRoutes.put(
  "/tenantsUpdate/:tenantId",
  isAuthAdmin,
  AdminController.updateTenant
);

adminRoutes.post(
  "/tenants",
  isAuthAdmin,
  AdminController.createTenant
);

adminRoutes.delete(
  "/tenants/:tenantId",
  isAuthAdmin,
  AdminController.deleteTenant
);


adminRoutes.get(
  "/chatflow/:tenantId",
  isAuthAdmin,
  AdminController.indexChatFlow
);
adminRoutes.put(
  "/settings/:tenantId",
  isAuthAdmin,
  AdminController.updateSettings
);

adminRoutes.get("/channels", isAuthAdmin, AdminController.indexChannels);
adminRoutes.post("/channels", isAuthAdmin, AdminController.storeChannel);

adminRoutes.post("/userTenants", isAuthAdmin, AdminController.storeUser);

export default adminRoutes;
