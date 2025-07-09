import { Network } from "alchemy-sdk";

export type Chain = {
	type: "evm" | "solana";
	chainId: number;
	name: string;
	cctpDomain: number | null;
	alchemyNetwork: Network;
};

export const arbitrum: Chain = {
	type: "evm",
	chainId: 42161,
	name: "Arbitrum",
	cctpDomain: 3,
	alchemyNetwork: Network.ARB_MAINNET,
};

export const base: Chain = {
	type: "evm",
	chainId: 8453,
	name: "Base",
	cctpDomain: 6,
	alchemyNetwork: Network.BASE_MAINNET,
};

export const bsc: Chain = {
	type: "evm",
	chainId: 56,
	name: "BNB Smart Chain",
	cctpDomain: null,
	alchemyNetwork: Network.BNB_MAINNET,
};

export const celo: Chain = {
	type: "evm",
	chainId: 42220,
	name: "Celo",
	cctpDomain: null,
	alchemyNetwork: Network.CELO_MAINNET,
};

export const ethereum: Chain = {
	type: "evm",
	chainId: 1,
	name: "Ethereum",
	cctpDomain: 0,
	alchemyNetwork: Network.ETH_MAINNET,
};

export const linea: Chain = {
	type: "evm",
	chainId: 59144,
	name: "Linea",
	cctpDomain: 11,
	alchemyNetwork: Network.LINEA_MAINNET,
};

export const mantle: Chain = {
	type: "evm",
	chainId: 5000,
	name: "Mantle",
	cctpDomain: null,
	alchemyNetwork: Network.MANTLE_MAINNET,
};

export const optimism: Chain = {
	type: "evm",
	chainId: 10,
	name: "Optimism",
	cctpDomain: 2,
	alchemyNetwork: Network.OPT_MAINNET,
};

export const polygon: Chain = {
	type: "evm",
	chainId: 137,
	name: "Polygon",
	cctpDomain: 7,
	alchemyNetwork: Network.POLYGONZKEVM_MAINNET,
};

export const solana: Chain = {
	type: "solana",
	chainId: 501,
	name: "Solana",
	cctpDomain: 5,
	alchemyNetwork: Network.SOLANA_MAINNET,
};

export const worldchain: Chain = {
	type: "evm",
	chainId: 480,
	name: "Worldchain",
	cctpDomain: 14,
	alchemyNetwork: Network.WORLDCHAIN_MAINNET,
};

export const supportedChains: Chain[] = [
	arbitrum,
	base,
	bsc,
	celo,
	ethereum,
	linea,
	mantle,
	optimism,
	polygon,
	solana,
	worldchain,
];

// https://developers.circle.com/stablecoins/supported-domains
const cctpV1Chains = [arbitrum, base, ethereum, optimism, polygon, solana];
const cctpV2Chains = [arbitrum, base, ethereum, linea, worldchain];

/** Given a chainId, return the chain. */
export function getChainById(chainId: number): Chain {
	const ret = supportedChains.find((c) => c.chainId === chainId);
	if (ret == null) throw new Error(`Unknown chainId ${chainId}`);
	return ret;
}

/** Returns the chain name for the given chainId. */
export function getChainName(chainId: number): string {
	return getChainById(chainId).name;
}

/** Returns the CCTP domain for the given chainId. */
export function getCCTPDomain(chainId: number): number | null {
	return getChainById(chainId).cctpDomain;
}

/** Returns true if the chain is a CCTP v1 chain. */
export function isCCTPV1Chain(chainId: number): boolean {
	return cctpV1Chains.some((c) => c.chainId === chainId);
}

/** Returns true if the chain is a CCTP v2 chain. */
export function isCCTPV2Chain(chainId: number): boolean {
	return cctpV2Chains.some((c) => c.chainId === chainId);
}

/**
 * Get block explorer URL for chain ID
 */
export function getChainExplorerByChainId(chainId: number): string | undefined {
	switch (chainId) {
		case arbitrum.chainId:
			return "https://arbiscan.io";
		case base.chainId:
			return "https://basescan.org";
		case bsc.chainId:
			return "https://bscscan.com";
		case celo.chainId:
			return "https://celoscan.io";
		case ethereum.chainId:
			return "https://etherscan.io";
		case linea.chainId:
			return "https://lineascan.build";
		case mantle.chainId:
			return "https://mantlescan.xyz";
		case optimism.chainId:
			return "https://optimistic.etherscan.io";
		case polygon.chainId:
			return "https://polygonscan.com";
		case solana.chainId:
			return "https://solscan.io";
		case worldchain.chainId:
			return "https://worldscan.org";
		default:
			return undefined;
	}
}

/**
 * Get block explorer address URL for chain ID and address.
 */
export function getChainExplorerAddressUrl(chainId: number, address: string) {
	const explorer = getChainExplorerByChainId(chainId);
	if (!explorer) {
		return undefined;
	}
	return `${explorer}/address/${address}`;
}

/**
 * Get block explorer transaction URL for chain ID and transaction hash.
 */
export function getChainExplorerTxUrl(chainId: number, txHash: string) {
	const explorer = getChainExplorerByChainId(chainId);
	if (!explorer) {
		return undefined;
	}
	return `${explorer}/tx/${txHash}`;
}
