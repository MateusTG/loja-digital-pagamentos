import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodType, where: 'body' | 'params' | 'query' = 'body') => 
    (req: Request, _res: Response, next: NextFunction) => {
        req[where] = schema.parse(req[where]);
        next();
    };
