import { Application } from "express";
import database from "./database";
import modules from "./modules";
import express from "./express";
import bullMQ from "./bull";
import waitForPostgresConnection from "./awaitPostgresConnection";
import PlanService from "../services/BillingServices/PlanService";

export default async function bootstrap(app: Application): Promise<void> {
  await waitForPostgresConnection();
  await express(app);
  await database(app);
  
  // Inicializar planos padrão
  try {
    await PlanService.initializeDefaultPlans();
  } catch (error) {
    console.error("Error initializing default plans:", error);
  }
  
  await modules(app);
  await bullMQ(app); // precisar subir na instancia dos bots
}
