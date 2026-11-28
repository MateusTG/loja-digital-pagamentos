import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(32, 'use pelo menos 32 caracteres'),
  GATEWAY_MODE: z.enum(['mock', 'juntosefaz']).default('mock'),
  JUNTOSEFAZ_BASE_URL: z.url().default('https://www.juntosefaz.com.br/gateway/api/v1'),
  JUNTOSEFAZ_TOKEN: z.string().optional(),
}).superRefine((e, ctx) => {
  if (e.GATEWAY_MODE === 'juntosefaz' && !e.JUNTOSEFAZ_TOKEN)
    ctx.addIssue({ code: 'custom', path: ['JUNTOSEFAZ_TOKEN'], message: 'obrigatório no modo juntosefaz' });
});

export const env = envSchema.parse(process.env); // lança erro se algo estiver errado
