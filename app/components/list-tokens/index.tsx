import type {
	Network,
	TokenMetadataResponse,
	TokenPriceByAddressResult,
} from "alchemy-sdk";
import { Check, Loader2, Sparkle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Address, formatUnits, getAddress, hexToBigInt } from "viem";
import { useAccount } from "wagmi";
import { alchemy } from "~/alchemy";
import { getNetworkName, knownAlchemyTokens, knownTokens } from "~/lib/tokens";
import { chainToLogo } from "../icons/chains";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import "./style.css";

type TokenBalance = {
	id: string;
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
	const [selectedTokenPriority, setSelectedTokenPriority] = useState("");
	const [tokenPriority, setTokenPriority] = useState<TokenBalance | null>(null);

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

	const selectedToken = useMemo(() => {
		return tokenBalances.find((token) => token.id === selectedTokenPriority);
	}, [tokenBalances, selectedTokenPriority]);

	const filteredTokenBalances = useMemo(() => {
		const filtered = tokenBalances.filter((token) => token.balance > 0);

		if (tokenPriority) {
			// Move priority token to the top
			const priorityIndex = filtered.findIndex(
				(token) => token.id === tokenPriority.id,
			);
			if (priorityIndex > 0) {
				const [priorityToken] = filtered.splice(priorityIndex, 1);
				filtered.unshift(priorityToken);
			}
		}

		return filtered;
	}, [tokenBalances, tokenPriority]);

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
							id: `${item.tokenAddress}-${knownToken.chainId}`,
							symbol: knownToken.symbol,
							name: knownToken.name,
							chainId: knownToken.chainId,
							balance: Number.parseFloat(
								Number.parseFloat(formattedBalance).toFixed(
									knownToken.decimals === 18 ? 5 : 2,
								),
							),
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

	const handleSetTokenPriority = useCallback(() => {
		console.log("set token priority", selectedToken);

		if (selectedToken) {
			setTokenPriority(selectedToken);
			setSelectedTokenPriority("");
		}
	}, [selectedToken]);

	const handleRetry = useCallback(() => {
		if (address) {
			fetchTokenBalances(address);
		}
	}, [address, fetchTokenBalances]);

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
			<div className="mb-4">
				<h2 className="mb-2 font-bold text-2xl">Choose your token priority</h2>
				<p className="text-muted-foreground">
					Choose your preferred payment token. It will be used as default for
					all transactions.
				</p>
			</div>

			<RadioGroup
				value={selectedTokenPriority}
				onValueChange={setSelectedTokenPriority}
				className="grid gap-4"
			>
				{filteredTokenBalances.map((item) => {
					const logo = item.logoURI;
					const isSelected = selectedTokenPriority === item.id;
					const chainLogo = chainToLogo[item.chainId];

					return (
						<div key={item.id} className="relative">
							{tokenPriority && tokenPriority.id === item.id && (
								<div className="-top-2 absolute right-0 flex h-auto w-auto items-center gap-1 rounded-md bg-accent-foreground px-2 py-1">
									<Sparkle className="size-3 text-accent" />
									<p className="text-accent text-xs">Priority</p>
								</div>
							)}

							<RadioGroupItem
								value={item.id}
								id={item.id}
								className="sr-only"
							/>

							<Label
								htmlFor={item.id}
								className="w-full cursor-pointer"
								onClick={() => {
									if (selectedTokenPriority === item.id) {
										setSelectedTokenPriority("");
									} else {
										setSelectedTokenPriority(item.id);
									}
								}}
							>
								<Card
									className={`w-full transition-all duration-200 hover:shadow-md ${
										isSelected
											? "border-primary bg-primary/5 ring-2 ring-primary"
											: "hover:border-primary/50"
									}`}
								>
									<CardContent className="flex items-center gap-3 p-3">
										<div className={"relative flex-shrink-0 rounded-lg p-1.5"}>
											{logo && (
												<img src={logo} alt={item.name} className="size-10" />
											)}

											{chainLogo && (
												<div className="chain-logo">{chainLogo}</div>
											)}
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between">
												<div>
													<div className="text-muted-foreground text-xs">
														Balance:
													</div>
													<h3 className="font-semibold text-sm">
														{item.balance}{" "}
														<span className="text-muted-foreground">
															{item.symbol}
														</span>
													</h3>
												</div>
												<span className="text-right font-medium text-muted-foreground text-sm">
													{getNetworkName(item.chainId)}
												</span>
											</div>
										</div>

										<div
											className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
												isSelected
													? "border-primary bg-primary"
													: "border-muted-foreground/30"
											}`}
										>
											{isSelected && (
												<Check className="h-3 w-3 text-primary-foreground" />
											)}
										</div>
									</CardContent>
								</Card>
							</Label>
						</div>
					);
				})}
			</RadioGroup>

			{/* Floating bottom confirmation container */}
			{selectedTokenPriority && selectedToken && (
				<div className="-translate-x-1/2 slide-in-from-bottom-4 fixed bottom-6 left-1/2 z-[60] w-full max-w-md transform animate-in px-4 duration-300">
					<Card className="border-2 border-primary/20 bg-background/70 shadow-2xl backdrop-blur-sm">
						<CardContent className="flex items-center gap-3 p-3">
							<div className="flex min-w-0 flex-1 items-center gap-3">
								<div className="min-w-0 flex-1">
									<p className="text-muted-foreground text-xs">
										Payment token selected
									</p>
									<p className="truncate font-semibold text-sm">
										{selectedToken.name} (
										{getNetworkName(selectedToken.chainId)})
									</p>
								</div>
							</div>

							<Button
								variant="default"
								size="sm"
								onClick={handleSetTokenPriority}
							>
								Set as priority
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSelectedTokenPriority("")}
								className="h-8 w-8 flex-shrink-0 p-0 transition-colors hover:bg-destructive/10 hover:text-destructive"
								aria-label="Clear selection"
							>
								<X className="h-4 w-4" />
							</Button>
						</CardContent>
					</Card>
				</div>
			)}

			{/* <div className="flex flex-col gap-3">
				{tokenBalances.map(renderTokenItem)}
			</div> */}
		</div>
	);
}
