import { z } from 'zod';

export const createPaymentSchema = z.object({
    productId: z.uuid(), 
    method: z.literal('pix')
});

export const paymentIdParamSchema = z.object({
    paymentId: z.uuid()
});