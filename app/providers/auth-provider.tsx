"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface User {
	address: string;
	signature: string;
}

interface LoginProps {
	signature: string;
	message: string;
	tokens?: any[] | null;
	walletapp: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isConnected: boolean;
	// login: (signature: string, message: string, tokens: string[], walletapp: string) => Promise<void>;
	logout: () => void;
	login: (props: LoginProps) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: false,
	isConnected: false,
	// login: async () => {},
	logout: () => {},
	login: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { address, isConnected } = useAccount();

	useEffect(() => {
		const checkSession = async () => {
			try {
				const savedUser = localStorage.getItem("user");
				if (savedUser) {
					const parsedUser = JSON.parse(savedUser);
					setUser(parsedUser);
				} else {
					setUser(null);
					localStorage.removeItem("user");
				}
			} catch (error) {
				console.error("Failed to restore session:", error);
				setUser(null);
				localStorage.removeItem("user");
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

	const login = async ({
		signature,
		message,
		tokens,
		walletapp,
	}: LoginProps) => {
		if (!address) return;

		setIsLoading(true);
		try {
			const userData: User = {
				address,
				signature,
			};

			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/preferences`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						address,
						message,
						signature,
						// @TODO: always empty when login
						preferred_tokens: tokens || [],
						walletapp: walletapp,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to set signature");
			}
			console.log({ userData });
			setUser(userData);
			localStorage.setItem("user", JSON.stringify(userData));
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		} finally {
			setIsLoading(false);
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
				isConnected: !!user,
				// login,
				logout,
				login,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
