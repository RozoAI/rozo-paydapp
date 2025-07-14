import type {
	Network,
	TokenMetadataResponse,
	TokenPriceByAddressResult,
} from "alchemy-sdk";
import { Check, Loader2, RefreshCcw, Sparkle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { type Address, formatUnits, getAddress, hexToBigInt } from "viem";
import { useAccount } from "wagmi";
import { alchemy } from "~/alchemy";
import { usePreferences } from "~/hooks/use-preferences";
import { getNetworkName, knownAlchemyTokens, knownTokens } from "~/lib/tokens";
import { useAuth } from "~/providers/auth-provider";
import { chainToLogo } from "../icons/chains";
import PrioritySuccessModal, {
	type PrioritySuccessModalRef,
} from "../priority-success-modal";
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
	const [isFetching, setIsFetching] = useState(false);
	const [isError, setIsError] = useState(false);
	const [selectedTokenPriority, setSelectedTokenPriority] = useState("");

	const prioritySuccessModalRef = useRef<PrioritySuccessModalRef>(null);

	const { address } = useAccount();
	const { isConnected } = useAuth();
	const { preferences, isLoading, setPreferredTokens, refetchPreferences } =
		usePreferences();

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

	// Find the priority token from preferences
	const tokenPriority = useMemo(() => {
		if (!preferences?.preferred_tokens?.length) return null;

		const priorityToken = preferences.preferred_tokens[0];
		return (
			tokenBalances.find(
				(token) =>
					token.chainId === priorityToken.chain &&
					token.address === priorityToken.address,
			) || null
		);
	}, [preferences, tokenBalances]);

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

	const fetchTokenBalances = async (walletAddress: Address) => {
		try {
			setIsFetching(true);
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

					const balanceBigInt = hexToBigInt(item.tokenBalance as `0x${string}`);
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
			setIsFetching(false);
		}
	};

	const isFetchingRef = useRef(false);

	useEffect(() => {
		if (!isConnected || !address) {
			setTokenBalances([]);
			setIsFetching(false);
			setIsError(false);
			isFetchingRef.current = false;
			return;
		}

		// Prevent double calls
		if (isFetchingRef.current) return;

		isFetchingRef.current = true;
		fetchTokenBalances(address).finally(() => {
			isFetchingRef.current = false;
		});
	}, [isConnected, address]);

	const handleSetTokenPriority = useCallback(async () => {
		if (!selectedToken) return;

		try {
			await setPreferredTokens([
				{
					chain: selectedToken.chainId,
					address: selectedToken.address,
				},
			]);

			// Refetch preferences to update the priority indicator
			await refetchPreferences();

			setSelectedTokenPriority("");
			prioritySuccessModalRef.current?.show();
		} catch (error) {
			// Error handling is already done in the hook
			console.error("Error setting token priority:", error);
		}
	}, [selectedToken, setPreferredTokens, refetchPreferences]);

	const handleRetry = () => {
		if (address) {
			fetchTokenBalances(address);
		}
	};

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

	if (!isConnected || !address) {
		return null;
	}

	return (
		<div className="mt-8 flex w-full flex-col gap-3">
			<div className="mb-4">
				<div className="flex items-start justify-between">
					<h2 className="mb-2 font-bold text-2xl">
						Choose your token priority
					</h2>
					<div className="flex items-center gap-2">
						<a
							href="https://docs.google.com/document/d/1X9gncap8UKGq57WaapPY_TtYPx5zY87nqnZkm5D8iN8/edit?tab=t.0"
							target="_blank"
							rel="noopener noreferrer"
							className="text-muted-foreground text-sm hover:text-primary hover:underline"
						>
							T&C
						</a>
						<Button variant="link" size="icon" onClick={handleRetry}>
							<RefreshCcw className="size-4" />
						</Button>
					</div>
				</div>
				<p className="text-muted-foreground">
					Choose your preferred payment token. It will be used as default for
					all transactions.
				</p>
			</div>

			{isFetching && (
				<div className="flex items-center justify-center">
					<Loader2 className="size-6 animate-spin" />
				</div>
			)}

			{!isFetching && filteredTokenBalances.length === 0 && (
				<div className="flex items-center justify-center">
					<p className="text-muted-foreground">No tokens found</p>
				</div>
			)}

			{!isFetching && filteredTokenBalances.length > 0 && (
				<>
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
												<div
													className={"relative flex-shrink-0 rounded-lg p-1.5"}
												>
													{logo && (
														<img
															src={logo}
															alt={item.name}
															className="size-10"
														/>
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
										disabled={isLoading}
									>
										{isLoading && <Loader2 className="size-4 animate-spin" />}
										Set as priority
									</Button>

									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedTokenPriority("")}
										className="h-8 w-8 flex-shrink-0 p-0 transition-colors hover:bg-destructive/10 hover:text-destructive"
										aria-label="Clear selection"
										disabled={isLoading}
									>
										<X className="h-4 w-4" />
									</Button>
								</CardContent>
							</Card>
						</div>
					)}
				</>
			)}

			<PrioritySuccessModal
				ref={prioritySuccessModalRef}
				tokenPriority={tokenPriority}
			/>
		</div>
	);
}
