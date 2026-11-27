import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  GATEWAY_MODE: z.enum(['mock', 'juntosefaz']).default('mock'),
  JUNTOSEFAZ_TOKEN: z.string().optional()
}).superRefine((e, ctx) => {
  if (e.GATEWAY_MODE === 'juntosefaz' && !e.JUNTOSEFAZ_TOKEN)
    ctx.addIssue({ code: 'custom', path: ['JUNTOSEFAZ_TOKEN'], message: 'obrigatório no modo juntosefaz' });
});
export const env = envSchema.parse(process.env); // lança erro se algo estiver errado