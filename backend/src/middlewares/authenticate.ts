import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/error';
import { verifyToken } from '../lib/jwt';

/** Exige "Authorization: Bearer <jwt>" e preenche req.user. */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    const payload = scheme === 'Bearer' && token ? verifyToken(token) : null;
    if (!payload) {
        throw new AppError(401, 'UNAUTHORIZED', 'Token ausente ou inválido');
    }
    req.user = { id: payload.sub };
    next();
};
