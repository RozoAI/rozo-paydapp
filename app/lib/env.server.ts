import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		INTERCOM_APP_ID: z.string().optional(),
		SESSION_SECRET: z.string().min(32).optional(),
		WALLET_CONNECT_ID: z.string(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
