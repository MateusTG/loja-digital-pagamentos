import type { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AppError } from '../lib/error';

const paymentService = new PaymentService();

const userIdOf = (req: Request): string => {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Token ausente ou inválido');
    return req.user.id;
};

// Erros (inclusive os assíncronos) seguem para o error-handler: o Express 5 repassa promessas rejeitadas.
export class PaymentController {
    static async createPayment(req: Request, res: Response) {
        const payment = await paymentService.createPayment(userIdOf(req), req.body);
        res.status(201).json(payment);
    }

    static async getPayment(req: Request<{ paymentId: string }>, res: Response) {
        const payment = await paymentService.getPayment(userIdOf(req), req.params.paymentId);
        res.json(payment);
    }
}
