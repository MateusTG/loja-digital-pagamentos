import type { Express } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { createPaymentSchema, paymentIdParamSchema } from '../schemas/payment.schema';

export const paymentRoutes = (app: Express) => {
    app.post('/payments', authenticate, validate(createPaymentSchema), PaymentController.createPayment);
    app.get('/payments/:paymentId', authenticate, validate(paymentIdParamSchema, 'params'), PaymentController.getPayment);
};
