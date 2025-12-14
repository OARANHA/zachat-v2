import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  // Se não houver API_KEY configurada, roda "aberto" (útil em dev local), mas loga.
  if (!env.apiKey) return next();

  const provided = req.header("x-api-key");
  if (!provided || provided !== env.apiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

