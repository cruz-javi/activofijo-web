import { z } from 'zod';

const envSchema = z.object({
  CORE_API_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_CORE_API_URL: z.string().url().default('http://localhost:3000'),
  SESSION_SECRET: z.string().min(32).default('super_secret_cookie_encryption_key_32_chars!'),
});

export const env = envSchema.parse({
  CORE_API_URL: process.env.CORE_API_URL,
  NEXT_PUBLIC_CORE_API_URL: process.env.NEXT_PUBLIC_CORE_API_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
});
