import {
	data,
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "react-router";

import "@rainbow-me/rainbowkit/styles.css";
import {
	PreventFlashOnWrongTheme,
	Theme,
	ThemeProvider,
	useTheme,
} from "remix-themes";
import { themeSessionResolver } from "~/lib/cookies/theme.server";
import { env } from "~/lib/env.server";
import type { Route } from "./+types/root";
import "./app.css";
import IntercomInitializer from "./components/intercom";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export async function loader({ request }: Route.LoaderArgs) {
	const { getTheme } = await themeSessionResolver(request);

	return data({
		theme: getTheme(),
		ENV: {
			INTERCOM_APP_ID: env.INTERCOM_APP_ID,
		},
	});
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider specifiedTheme={Theme.LIGHT} themeAction="/api/set-theme">
			{children}
		</ThemeProvider>
	);
}

export default function App() {
	const data = useLoaderData<typeof loader>();
	const [theme] = useTheme();
	return (
		<html
			lang="en"
			className={`${theme} overflow-x-hidden`}
			data-theme={theme ?? ""}
			suppressHydrationWarning
		>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(data?.theme)} />
				<Meta />
				<Links />
			</head>
			<body className="h-svh overscroll-none bg-card antialiased md:h-auto md:bg-background">
				<Outlet />
				<IntercomInitializer appId={data.ENV.INTERCOM_APP_ID as string} />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto p-4 pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
