import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    RAZORPAY_KEY_ID: z.string().min(1).default('rzp_test_mock'),
    RAZORPAY_KEY_SECRET: z.string().min(1).default('mock_secret'),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1).default('mock_webhook_secret'),
    WHATSAPP_API_TOKEN: z.string().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    MSG91_AUTH_KEY: z.string().optional(),
    MSG91_SENDER_ID: z.string().default('SCHLRP'),
  },
  client: {
    NEXT_PUBLIC_APP_DOMAIN: z.string().default('localhost:3000'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_NAME: z.string().default('School ERP'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
