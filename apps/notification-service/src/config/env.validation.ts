import { z } from 'zod';

export const envSchema = z.object({
    MAIL_HOST: z.string().optional(),
    MAIL_PORT: z.string().optional().transform(Number),
    MAIL_SECURE: z.string().optional().transform(Boolean),
    MAIL_USER: z.string(),
    MAIL_PASS: z.string(),
    MAIL_FROM: z.string().optional(),
    JWT_SECRET: z.string(),
    TOKEN_PASSWORD_EXPIRATION: z.string(),
    FRONTEND_URL: z.string(),
});

export const validateEnv = (env: Record<string, unknown>) => {
    const result = envSchema.safeParse(env);

    if (!result.success) {
        console.error('Invalid environment variables', result.error.format());
        process.exit(1);
    }

    return result.data;
};