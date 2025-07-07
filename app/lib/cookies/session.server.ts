import { createCookieSessionStorage } from "react-router";
import { env } from "~/lib/env.server";

export const signSessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__sign",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [env.SESSION_SECRET ?? "NOT_A_STRONG_SECRET"],
		secure: env.NODE_ENV === "production",
	},
});
