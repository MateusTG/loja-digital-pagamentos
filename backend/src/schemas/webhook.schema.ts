import { z } from 'zod';

export const webhookSchema = z.object({
    gatewayId: z.string(),
    status: z.enum(['pending', 'approved', 'declined', 'failed', 'cancelled', 'refunded', 'expired'])
});