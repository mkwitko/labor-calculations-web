import { z } from 'zod'

const envSchema = z.object({
	VITE_HTTP_API_URL: z.string(),
	VITE_STORAGE_URL: z.string(),
	VITE_DEFAULT_FGTS_RATE: z.coerce.number().min(0).max(100),
	VITE_DEFAULT_MINIMUM_WAGE: z.coerce.number().min(0),
	VITE_SENTRY_DSN: z.string().optional(),
	VITE_POSTHOG_KEY: z.string().optional(),
	VITE_POSTHOG_HOST: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
