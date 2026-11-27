import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    phoneNumber: z.string().min(10).optional()
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8)
});