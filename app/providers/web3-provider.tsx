import {
	connectorsForWallets,
	darkTheme,
	lightTheme,
	RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
	binanceWallet,
	coinbaseWallet,
	metaMaskWallet,
	okxWallet,
	phantomWallet,
	rainbowWallet,
	trustWallet,
	walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { Theme, useTheme } from "remix-themes";
import { createConfig, http, WagmiProvider } from "wagmi";
import { arbitrum, bsc, celo, mainnet } from "wagmi/chains";

const connectors = connectorsForWallets(
	[
		{
			groupName: "Recommended",
			wallets: [metaMaskWallet, okxWallet],
		},
		{
			groupName: "Others",
			wallets: [
				coinbaseWallet,
				trustWallet,
				rainbowWallet,
				walletConnectWallet,
				binanceWallet,
				phantomWallet,
			],
		},
	],
	{
		appName: "Rozo Pay DApp",
		appIcon: "https://rozo.ai/rozo-logo.png",
		appUrl: "https:/dapp.rozo.ai/",
		projectId: import.meta.env.VITE_WALLET_CONNECT_ID,
	},
);

const config = createConfig({
	connectors,
	chains: [mainnet, arbitrum, bsc, celo],
	transports: {
		[mainnet.id]: http(),
		[arbitrum.id]: http(),
		[bsc.id]: http(),
		[celo.id]: http(),
	},
	ssr: true,
});

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
