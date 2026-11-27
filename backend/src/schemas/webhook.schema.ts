import { z } from 'zod';

export const webhookSchema = z.object({
    gatewayId: z.string(),
    status: z.enum(['pending', 'completed', 'failed'])
});