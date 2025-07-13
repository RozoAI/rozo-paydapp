import { Theme, useTheme } from "remix-themes";
import { useAccount } from "wagmi";
import BoxedCard from "~/components/boxed-card";
import ConnectWalletButton from "~/components/connect-wallet-button";
import ListTokens from "~/components/list-tokens";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { CardContent } from "~/components/ui/card";
import { useAuth } from "~/providers/auth-provider";

export default function Home() {
	const [theme] = useTheme();

	const { address } = useAccount();
	const { isConnected } = useAuth();

	return (
		<BoxedCard>
			<CardContent className="flex flex-1 flex-col items-center justify-center pt-6 md:pt-0">
				<div className="mt-6 mb-2 flex flex-col items-center justify-center gap-1">
					<Avatar className="size-8 rounded-none">
						<AvatarImage
							src={theme === Theme.DARK ? "/logo-white.png" : "/logo.png"}
							alt="Rozo Pay DApp"
						/>
					</Avatar>
					<span className="font-bold text-foreground text-xl ">
						Rozo Pay DApp
					</span>
				</div>

				<p className="my-4 text-center text-lg">
					Connect your wallet to access personalized token management. Select
					your preferred payment tokens, pin your favorites as default, and
					enjoy a streamlined crypto experience designed for mobile-first
					interactions.
				</p>

				<ConnectWalletButton />

				{isConnected && address && <ListTokens />}
			</CardContent>
		</BoxedCard>
	);
}
