import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	INTERCOM_APP_ID: z.string().optional(),
	SESSION_SECRET: z.string().min(32),
});
export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
	try {
		return envSchema.parse(process.env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const missingVars = error.errors
				.map((err) => err.path.join("."))
				.join(", ");
			throw new Error(
				`Missing or invalid environment variables: ${missingVars}`,
			);
		}
		throw error;
	}
}

const parsedEnv = getEnv();

export const env = {
	...parsedEnv,
	isDev: parsedEnv.NODE_ENV === "development",
	isProd: parsedEnv.NODE_ENV === "production",
	isTest: parsedEnv.NODE_ENV === "test",
};
