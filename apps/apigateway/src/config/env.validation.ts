import { z } from 'zod';

export const envSchema = z.object({
    PORT: z.string().regex(/^\d+$/).transform(Number),  
    JWT_SECRET: z.string(),
    JWT_EXPIRATION: z.string(),
    JWT_REFRESH_EXPIRATION: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_URL: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PASSWORD: z.string(),
    REDIS_PORT: z.string().transform(Number),
    // CACHE_TTL: z.string().transform(Number),
    FE_BASE_URL: z.string(),
});

export const validateEnv = (env: Record<string, unknown>) => {
    const result = envSchema.safeParse(env);

    if (!result.success) {
        console.error('Invalid environment variables', result.error.format());
        process.exit(1);
    }

    return result.data;
};