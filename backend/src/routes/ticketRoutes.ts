import express from "express";
import isAuth from "../middleware/isAuth";

import * as TicketController from "../controllers/TicketController";

const ticketRoutes = express.Router();

ticketRoutes.get("/", isAuth, TicketController.index);

ticketRoutes.get("/:ticketId", isAuth, TicketController.show);

ticketRoutes.post("/", isAuth, TicketController.store);

ticketRoutes.put("/:ticketId", isAuth, TicketController.update);

ticketRoutes.delete("/:ticketId", isAuth, TicketController.remove);

ticketRoutes.get(
  "/:ticketId/logs",
  isAuth,
  TicketController.showLogsTicket
);

export default ticketRoutes;
