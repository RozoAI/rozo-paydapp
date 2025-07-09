import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { Copy, Loader2, Settings, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useAuth } from "~/providers/auth-provider";
import { Button } from "../ui/button";

export default function ConnectWalletButton() {
	const { openConnectModal } = useConnectModal();
	const { isConnected, status, isConnecting, address } = useAccount();
	const { disconnect } = useDisconnect();

	const { signMessageAsync } = useSignMessage();
	const { signMessage } = useAuth();

	const [_isLoading, setIsLoading] = useState<boolean>(false);
	const [firstLoad, setFirstLoad] = useState<boolean>(false);

	const generateSign = async () => {
		setIsLoading(true);
		try {
			const timestamp = Date.now();
			const message = `RozoPayDAppLogin:${timestamp}`;

			const signature = await signMessageAsync({ message });
			await signMessage(signature);

			setIsLoading(false);
		} catch (_error: any) {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (status === "reconnecting" && isConnected) {
			disconnect();
			setFirstLoad(false);
		} else if (status === "connected" && isConnected && firstLoad) {
			// generateSign();
		}
	}, [status, isConnected, firstLoad, disconnect]);

	const handleAuth = async () => {
		if (isConnected) {
			disconnect();
		}

		openConnectModal?.();
		setFirstLoad(true);
	};

	const handleCopy = async () => {
		if (!address) return;
		await navigator.clipboard.writeText(address);
		toast.success("Copied to clipboard");
	};

	return (
		<ConnectButton.Custom>
			{({ account, chain, openAccountModal, openConnectModal, mounted }) => {
				const ready = mounted;
				const connected = ready && account && chain;

				if (!ready) {
					return (
						<div style={{ pointerEvents: "none", userSelect: "none" }}>
							<Button disabled>Loading...</Button>
						</div>
					);
				}

				if (!connected) {
					return (
						<Button onClick={handleAuth} disabled={isConnecting} size="lg">
							{isConnecting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Connecting...
								</>
							) : (
								<>
									<Wallet className="h-4 w-4" />
									Connect Wallet
								</>
							)}
						</Button>
					);
				}

				if (connected) {
					return (
						<div className="mx-auto flex w-full max-w-full items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-3 sm:gap-4 dark:border-green-800 dark:bg-green-900/20">
							<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
								{chain.hasIcon && chain.iconUrl && (
									<div className="flex-shrink-0">
										<img
											alt={chain.name ?? "Chain icon"}
											src={chain.iconUrl}
											width={20}
											height={20}
											className="sm:h-6 sm:w-6"
											style={{ borderRadius: "999px" }}
										/>
									</div>
								)}
								<div className="flex min-w-0 flex-1 flex-col">
									<span className="truncate font-medium text-green-700 text-xs sm:text-sm dark:text-green-300">
										Connected
									</span>
									<span className="truncate text-green-600 text-xs dark:text-green-400">
										{account.displayName}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									onClick={handleCopy}
									className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
									size="icon"
									type="button"
									variant="ghost"
								>
									<Copy className="h-4 w-4" />
								</Button>
								<Button
									onClick={openAccountModal}
									className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
									size="icon"
									type="button"
									variant="ghost"
								>
									<Settings className="h-4 w-4" />
								</Button>
							</div>
						</div>
					);
				}

				return (
					<Button onClick={openConnectModal} size="lg">
						<Wallet className="h-4 w-4" />
						Connect Wallet
					</Button>
				);
			}}
		</ConnectButton.Custom>
	);
}
