import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as SettingController from "../controllers/SettingController";

const settingRoutes = Router();

settingRoutes.get("/", isAuth, SettingController.index);

// routes.get("/:settingKey", isAuth, SettingsController.show);

// change setting key to key in future
settingRoutes.put("/:settingKey", isAuth, SettingController.update);

export default settingRoutes;
