"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface User {
	address: string;
	signature: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isConnected: boolean;
	login: (signature: string) => Promise<void>;
	logout: () => void;
	signMessage: (signature: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: false,
	isConnected: false,
	login: async () => {},
	logout: () => {},
	signMessage: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { address, isConnected } = useAccount();

	useEffect(() => {
		// Check for existing session on mount
		const checkSession = async () => {
			try {
				// First check local storage
				const savedUser = localStorage.getItem("user");
				if (savedUser) {
					setUser(JSON.parse(savedUser));
				}

				// Then verify with server session
				const response = await fetch("/api/get-sign");
				const data = await response.json();

				if (data.signature) {
					// If there's a server session but no local storage, restore from server
					if (!savedUser && address) {
						const userData: User = {
							address,
							signature: data.signature,
						};
						setUser(userData);
						localStorage.setItem("user", JSON.stringify(userData));
					}
				} else {
					// If no server session, clear local storage
					setUser(null);
					localStorage.removeItem("user");
				}
			} catch (error) {
				console.error("Failed to restore session:", error);
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();
	}, [address]);

	useEffect(() => {
		// Clear user when wallet disconnects
		if (!isConnected && user) {
			logout();
		}
	}, [isConnected]);

	const login = async (signature: string) => {
		if (!address) return;

		setIsLoading(true);
		try {
			const userData: User = {
				address,
				signature,
			};

			// Call the API to set signature in session
			const response = await fetch("/api/set-sign", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ signature }),
			});

			if (!response.ok) {
				throw new Error("Failed to set signature");
			}

			setUser(userData);
			localStorage.setItem("user", JSON.stringify(userData));
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signMessage = async (signature: string) => {
		if (!address) return;

		try {
			await login(signature);
		} catch (error) {
			console.error("Sign message failed:", error);
			throw error;
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isConnected,
				login,
				logout,
				signMessage,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
