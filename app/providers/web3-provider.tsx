import {
	darkTheme,
	lightTheme,
	RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { Theme, useTheme } from "remix-themes";
import { WagmiProvider } from "wagmi";
import { config } from "~/wagmi";

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
	const [theme] = useTheme();

	// Memoize the theme to prevent unnecessary re-renders
	const rainbowKitTheme = useMemo(() => {
		return theme === Theme.DARK ? darkTheme() : lightTheme();
	}, [theme]);

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider theme={rainbowKitTheme}>
					{children}
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
