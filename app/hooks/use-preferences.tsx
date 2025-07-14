import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";
import { useAuth } from "~/providers/auth-provider";

export type PreferredToken = {
	chain: number;
	address: string;
};

export type UserPreferences = {
	address: string;
	preferred_chains: null;
	preferred_tokens: PreferredToken[];
	walletapp: string;
	ip: null;
	meta: null;
	created_at: string;
	updated_at: string;
};

export function usePreferences() {
	const [preferences, setPreferences] = useState<UserPreferences | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { address } = useAccount();
	const { user } = useAuth();
	const { signMessageAsync } = useSignMessage();

	// Add ref to track fetch state
	const isFetchingRef = useRef(false);

	const fetchPreferences = useCallback(async () => {
		if (!address) return;

		// Prevent double calls
		if (isFetchingRef.current) return;

		try {
			isFetchingRef.current = true;
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/preferences/${address}`,
			);

			if (!response.ok) {
				throw new Error("Failed to fetch preferences");
			}

			const data = await response.json();
			setPreferences(data);
		} catch (error) {
			console.error("Error fetching preferences:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to fetch preferences",
			);
		} finally {
			isFetchingRef.current = false;
		}
	}, [address]);

	const setPreferredTokens = useCallback(
		async (tokens: PreferredToken[]) => {
			if (!address || !user) {
				toast.error("Please connect your wallet to set preferences");
				return;
			}

			try {
				setIsLoading(true);
				const message = `Set address preference for ${address} at ${new Date().toISOString()}`;
				const walletApp = localStorage.getItem("wagmi.recentConnectorId");

				const signature = await signMessageAsync({ message });

				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/preferences`,
					{
						method: "POST",
						body: JSON.stringify({
							address,
							message,
							signature,
							preferred_tokens: tokens,
							walletapp: walletApp?.replace(/"/g, "") || "",
						}),
						headers: {
							"Content-Type": "application/json",
						},
					},
				);

				if (!response.ok) {
					throw new Error("Failed to set preferences");
				}

				const data = await response.json();
				setPreferences(data);
				toast.success("Preferences updated successfully");
			} catch (error) {
				console.error("Error setting preferences:", error);
				toast.error(
					error instanceof Error ? error.message : "Failed to set preferences",
				);
			} finally {
				setIsLoading(false);
			}
		},
		[address, user, signMessageAsync],
	);

	useEffect(() => {
		if (address) {
			fetchPreferences();
		} else {
			setPreferences(null);
			isFetchingRef.current = false; // Reset ref when no address
		}
	}, [address, fetchPreferences]);

	return {
		preferences,
		isLoading,
		setPreferredTokens,
		refetchPreferences: fetchPreferences,
	};
}
