import type {
	Network,
	TokenMetadataResponse,
	TokenPriceByAddressResult,
} from "alchemy-sdk";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Address, formatUnits, getAddress, hexToBigInt } from "viem";
import { useAccount } from "wagmi";
import { alchemy } from "~/alchemy";
import { knownAlchemyTokens, knownTokens } from "~/lib/tokens";
import { Button } from "../ui/button";

type TokenBalance = {
	network: Network;
	address: string;
	tokenBalance: string;
	tokenMetadata?: TokenMetadataResponse;
	tokenPrices?: TokenPriceByAddressResult;
	tokenAddress?: string;
	symbol?: string;
	name: string;
	chainId: number;
	balance: number;
	decimals?: number;
	logoURI?: string;
};

export default function ListTokens() {
	const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);

	const { isConnected, address } = useAccount();

	// Memoize known token data to avoid recalculations
	const { knownTokenNetworks, tokenMap } = useMemo(() => {
		const networks = new Set(knownAlchemyTokens.map((t) => t.alchemyNetwork));
		const map = new Map(knownTokens.map((token) => [token.token, token]));

		return {
			knownTokenNetworks: Array.from(networks),
			tokenMap: map,
		};
	}, []);

	const fetchTokenBalances = useCallback(
		async (walletAddress: Address) => {
			try {
				setIsLoading(true);
				setIsError(false);

				const response = await alchemy.portfolio.getTokensByWallet([
					{
						address: walletAddress,
						networks: knownTokenNetworks,
					},
				]);

				const processedTokens = (response.data.tokens as TokenBalance[])
					.map((item) => {
						if (!item.tokenAddress) return null;

						const tokenAddress = getAddress(item.tokenAddress);
						const knownToken = tokenMap.get(tokenAddress);

						if (!knownToken) return null;

						const balanceBigInt = hexToBigInt(
							item.tokenBalance as `0x${string}`,
						);
						const decimals =
							item.tokenMetadata?.decimals ?? knownToken.decimals ?? 18;
						const formattedBalance = formatUnits(balanceBigInt, decimals);

						return {
							...item,
							symbol: knownToken.symbol,
							name: knownToken.name,
							chainId: knownToken.chainId,
							balance: Number.parseFloat(formattedBalance),
							logoURI: knownToken.logoURI,
							network: knownToken.chainId as unknown as Network,
						};
					})
					.filter(Boolean)
					.sort((a, b) => {
						const balanceA = a?.balance || 0;
						const balanceB = b?.balance || 0;
						return balanceB - balanceA;
					}) as TokenBalance[];

				setTokenBalances(processedTokens);
			} catch (error) {
				console.error("Failed to fetch token balances:", error);
				setIsError(true);
				toast.error("Failed to fetch token balances");
			} finally {
				setIsLoading(false);
			}
		},
		[knownTokenNetworks, tokenMap],
	);

	// Reset state when wallet disconnects
	useEffect(() => {
		if (!isConnected || !address) {
			setTokenBalances([]);
			setIsLoading(false);
			setIsError(false);
			return;
		}

		fetchTokenBalances(address);
	}, [isConnected, address, fetchTokenBalances]);

	const handleRetry = useCallback(() => {
		if (address) {
			fetchTokenBalances(address);
		}
	}, [address, fetchTokenBalances]);

	const renderTokenItem = useCallback((token: TokenBalance) => {
		if (!token) return null;

		return (
			<div
				key={`${token.tokenAddress}-${token.chainId}`}
				className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
			>
				{token.logoURI && (
					<div className="relative">
						<img
							src={token.logoURI}
							alt={token.name}
							className="size-10"
							loading="lazy"
						/>
					</div>
				)}
				<div className="flex flex-1 flex-col gap-1">
					<span className="font-medium">
						{token.balance}{" "}
						<span className="text-muted-foreground">
							on {token.name || "-"}
						</span>
					</span>
				</div>
			</div>
		);
	}, []);

	if (isLoading) {
		return <Loader2 className="mt-6 size-8 animate-spin" />;
	}

	if (isError) {
		return (
			<div className="mt-6 flex flex-col items-center gap-2">
				<div className="text-destructive">Error fetching token balances</div>
				<Button variant="outline" onClick={handleRetry}>
					Try again
				</Button>
			</div>
		);
	}

	if (!isConnected || !address || tokenBalances.length === 0) {
		return null;
	}

	return (
		<div className="mt-8 flex w-full flex-col gap-3">
			<h2 className="font-semibold text-lg">Token Balances</h2>
			<div className="flex flex-col gap-3">
				{tokenBalances.map(renderTokenItem)}
			</div>
		</div>
	);
}
