import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";
import { env } from "~/lib/env.server";

export const THEME_SESSION_KEY = "__remix-themes";
const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: THEME_SESSION_KEY,
		domain: process.env?.APP_URL
			? new URL(process.env.APP_URL).hostname
			: "localhost",
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secrets: [env?.SESSION_SECRET ?? "NOT_A_STRONG_SECRET"],
		secure: process.env.NODE_ENV === "production",
	},
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
