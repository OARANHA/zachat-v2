import { Router } from "express";

import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";
import checkPlanLimits from "../middleware/checkPlanLimits";

const userRoutes = Router();

/**
 * Rotas de usuários.
 *
 * IMPORTANTE:
 * - O prefixo completo agora vem de routes/index.ts:
 *   routes.use('/api/users', userRoutes)
 *
 * Ou seja, os caminhos finais são:
 *   GET    /api/users
 *   POST   /api/users
 *   GET    /api/users/:userId
 *   PUT    /api/users/:userId
 *   PUT    /api/users/:userId/configs
 *   DELETE /api/users/:userId
 */

userRoutes.get(
  "/",
  isAuth,
  UserController.index
);

userRoutes.post(
  "/",
  isAuth,
  checkPlanLimits("users"),
  UserController.store
);

userRoutes.put(
  "/:userId",
  isAuth,
  UserController.update
);

userRoutes.put(
  "/:userId/configs",
  isAuth,
  UserController.updateConfigs
);

userRoutes.get(
  "/:userId",
  isAuth,
  UserController.show
);

userRoutes.delete(
  "/:userId",
  isAuth,
  UserController.remove
);

export default userRoutes;
