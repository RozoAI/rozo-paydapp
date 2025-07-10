import { Outlet } from "react-router";
import FabActions from "~/components/fab-actions";
import Footer from "~/components/footer";
import { Toaster } from "~/components/ui/sonner";
import { AuthProvider } from "~/providers/auth-provider";
import { Web3Provider } from "~/providers/web3-provider";

export function meta() {
	return [
		{ title: "Rozo | One Tap to Pay" },
		{ name: "description", content: "Increase the GDP of Crypto" },
	];
}

export default function Layout() {
	return (
		<Web3Provider>
			<AuthProvider>
				<main className="flex h-full flex-col gap-4 md:min-h-screen md:items-center md:justify-center md:py-4">
					<Outlet />
					<Footer className="py-8" />
					<FabActions />
				</main>
				<Toaster position="top-center" />
			</AuthProvider>
		</Web3Provider>
	);
}
