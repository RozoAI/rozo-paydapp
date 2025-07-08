import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";

export const config = getDefaultConfig({
	chains: [mainnet, polygon, optimism, arbitrum, base],
	ssr: false,
	projectId: import.meta.env.VITE_WALLET_CONNECT_ID,
	appName: "Rozo Pay DApp",
	appIcon: "https://rozo.ai/rozo-logo.png",
	appUrl: "https:/dapp.rozo.ai/",
});
