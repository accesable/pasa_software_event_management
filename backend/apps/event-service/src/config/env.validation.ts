import { z } from 'zod';

export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
});

export const validateEnv = (env: Record<string, unknown>) => {
    const result = envSchema.safeParse(env);

    if (!result.success) {
        console.error('Invalid environment variables', result.error.format());
        process.exit(1);
    }

    return result.data;
};