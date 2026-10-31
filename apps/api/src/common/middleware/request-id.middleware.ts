import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existing = req.headers['x-request-id'] as string;
    const requestId = existing && existing.trim().length > 0 ? existing : uuidv4();

    const reqWithId = req as Request & { id?: string };
    req.headers['x-request-id'] = requestId;
    reqWithId.id = requestId;
    res.setHeader('X-Request-Id', requestId);

    next();
  }
}
