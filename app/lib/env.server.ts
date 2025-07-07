import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	DAIMO_API_KEY: z.string(),
	DAIMO_API_URL: z.string().url(),
	INTERCOM_APP_ID: z.string().optional(),
	SESSION_SECRET: z.string().min(32).optional(),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
	const result = envSchema.safeParse(process.env);
	
	if (!result.success) {
		const missingVars = result.error.errors
			.map((err) => `${err.path.join(".")}: ${err.message}`)
			.join(", ");
		throw new Error(
			`Missing or invalid environment variables: ${missingVars}`,
		);
	}
	
	return result.data;
}

const parsedEnv = getEnv();

export const env = {
	...parsedEnv,
	isDev: parsedEnv.NODE_ENV === "development",
	isProd: parsedEnv.NODE_ENV === "production",
	isTest: parsedEnv.NODE_ENV === "test",
};
