import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  GATEWAY_MODE: z.enum(['mock', 'juntosefaz']).default('mock'),
  JUNTOSEFAZ_TOKEN: z.string().optional(),
});
export const env = envSchema.parse(process.env); // lança erro se algo estiver errado