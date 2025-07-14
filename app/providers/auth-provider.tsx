"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface User {
	address: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isConnected: boolean;
	logout: () => void;
	login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: false,
	isConnected: false,
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

	const login = async () => {
		if (!address) return;

		setIsLoading(true);
		try {
			const userData: User = {
				address,
			};

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
				isConnected: !!user && isConnected,
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
