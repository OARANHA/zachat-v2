import { Request, Response } from 'express';
import register from '../config/prometheus';

export default class MetricsController {
  public async index(req: Request, res: Response): Promise<Response> {
    res.set('Content-Type', register.contentType);
    return res.send(await register.metrics());
  }
}