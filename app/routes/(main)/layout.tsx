import { Outlet } from "react-router";
import FabActions from "~/components/fab-actions/fab-actions";
import Footer from "~/components/footer/footer";
import { Providers } from "~/lib/providers";

export function meta() {
	return [
		{ title: "Rozo | One Tap to Pay" },
		{ name: "description", content: "Increase the GDP of Crypto" },
	];
}

export default function Layout() {
	return (
		<Providers>
			<main className="flex h-full flex-col gap-4 md:min-h-screen md:items-center md:justify-center md:py-4">
				<Outlet />
				<Footer className="py-8" />
				<FabActions />
			</main>
		</Providers>
	);
}
