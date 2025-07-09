import type {
	Network,
	TokenMetadataResponse,
	TokenPriceByAddressResult,
} from "alchemy-sdk";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Address, formatEther } from "viem";
import { useAccount } from "wagmi";
import { alchemy } from "~/alchemy";
import { knownAlchemyTokens } from "~/lib/tokens";
import { chainToLogo } from "../icons/chains";
import { Button } from "../ui/button";

type TokenBalancesWithAddress = {
	data: {
		tokens: Array<{
			network: Network;
			address: string;
			tokenBalance: string;
			tokenAddress: string;
			tokenMetadata?: TokenMetadataResponse;
			tokenPrices?: TokenPriceByAddressResult;
		}>;
		pageKey: string;
	};
};

export default function ListTokens() {
	const [tokenBalances, setTokenBalances] = useState<TokenBalancesWithAddress>({
		data: {
			tokens: [],
			pageKey: "",
		},
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);

	const { isConnected, address } = useAccount();

	const networks = [
		...new Set(knownAlchemyTokens.map((t) => t.alchemyNetwork)),
	];

	const fetchTokenBalances = async (address: Address) => {
		try {
			const tokens = await alchemy.portfolio.getTokensByWallet([
				{
					address,
					networks,
				},
			]);
			setTokenBalances(tokens as TokenBalancesWithAddress);
			setIsLoading(false);
			setIsError(false);
		} catch (error) {
			console.error(error);
			setIsLoading(false);
			setIsError(true);
			toast.error("Failed to fetch token balances");
		}
	};

	useEffect(() => {
		if (isConnected && address) {
			setIsLoading(true);

			fetchTokenBalances(address);
		} else {
			setTokenBalances({
				data: {
					tokens: [],
					pageKey: "",
				},
			});
			setIsLoading(false);
		}
	}, [isConnected, address]);

	const knownTokenAddresses = [
		...new Set(knownAlchemyTokens.map((t) => t.token)),
	];

	const filteredTokens = useMemo(() => {
		return tokenBalances.data.tokens
			.filter((token) => knownTokenAddresses.includes(token.tokenAddress))
			.sort((a, b) => {
				return (
					Number(formatEther(BigInt(b.tokenBalance))) -
					Number(formatEther(BigInt(a.tokenBalance)))
				);
			})
			.map((token) => {
				const knownToken = knownAlchemyTokens.find(
					(t) => t.token === token.tokenAddress,
				);

				if (!knownToken) {
					return null;
				}

				return {
					...token,
					symbol: knownToken.symbol,
					name: knownToken.name,
					chainId: knownToken.chainId,
				};
			});
	}, [tokenBalances]);

	const handleTryAgain = () => {
		setIsError(false);
		setIsLoading(true);
		if (address) {
			fetchTokenBalances(address as Address);
		}
	};

	return (
		<>
			{isLoading && <Loader2 className="mt-6 size-8 animate-spin" />}
			{isError && (
				<div className="mt-6 flex flex-col items-center gap-2">
					<div className="text-destructive">Error fetching token balances</div>
					<Button variant="outline" onClick={handleTryAgain}>
						Try again
					</Button>
				</div>
			)}

			{!isLoading &&
				isConnected &&
				address &&
				(tokenBalances.data.tokens || [])?.length > 0 && (
					<div className="mt-8 flex w-full flex-col gap-3">
						<h2 className="font-semibold text-lg">Token Balances</h2>

						<div className="flex flex-col gap-3">
							{filteredTokens.map((token) => {
								if (!token) {
									return null;
								}

								const ChainIcon = chainToLogo[token.chainId];

								const formattedBalance = Number(
									formatEther(BigInt(token.tokenBalance)),
								).toLocaleString(undefined, {
									maximumFractionDigits: 6,
								});

								return (
									<div
										key={`${token.tokenAddress}-${token.network}`}
										className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
									>
										{ChainIcon && <div>{ChainIcon}</div>}
										<div className="flex flex-1 flex-col gap-1">
											<span className="font-medium">
												{formattedBalance}{" "}
												<span className="text-muted-foreground">
													on {token.name}
												</span>
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
		</>
	);
}
