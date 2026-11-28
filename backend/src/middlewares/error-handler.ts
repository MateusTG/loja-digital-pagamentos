import type { Express, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, GatewayError } from '../lib/error';

function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError) {
        res.status(400).json({ error: 'VALIDATION_ERROR', issues: err.issues });
        return;
    }
    if (err instanceof AppError) {
        if (err instanceof GatewayError) {
            // Detalhes do gateway ficam só no log (nunca contêm o header Authorization).
            console.error(`[gateway] ${err.code} (status do gateway: ${err.gatewayStatus ?? '-'})`, err.details ?? '');
        }
        res.status(err.statusCode).json({ error: err.code, message: err.message });
        return;
    }
    console.error(err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Erro interno' });
}

function notFoundHandler(_req: Request, res: Response) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Rota não encontrada' });
}

function appErrorHandler(app: Express) {
    app.use(notFoundHandler);
    app.use(errorHandler);
}

export { errorHandler, notFoundHandler, appErrorHandler };
