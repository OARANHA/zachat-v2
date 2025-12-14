import express from "express";
import isAuth from "../middleware/isAuth";

import * as QueueController from "../controllers/QueueController";

const queueRoutes = express.Router();

queueRoutes.post("/", isAuth, QueueController.store);
queueRoutes.get("/", isAuth, QueueController.index);
queueRoutes.put("/:queueId", isAuth, QueueController.update);
queueRoutes.delete("/:queueId", isAuth, QueueController.remove);

export default queueRoutes;
