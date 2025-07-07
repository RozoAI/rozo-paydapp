import { getDefaultConfig, RozoPayProvider } from "@rozoai/intent-pay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme, useTheme } from "remix-themes";
import { createConfig, WagmiProvider } from "wagmi";

const config = createConfig(
	getDefaultConfig({
		appName: "Rozo Pay",
		appIcon: "https://rozo.ai/rozo-logo.png",
	}),
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	const [theme] = useTheme();
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RozoPayProvider mode={theme === Theme.DARK ? "dark" : "light"}>
					{children}
				</RozoPayProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
