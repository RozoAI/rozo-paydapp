import { Theme, useTheme } from "remix-themes";
import BoxedCard from "~/components/boxed-card/boxed-card";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { CardContent } from "~/components/ui/card";

export default function Home() {
	const [theme] = useTheme();
	return (
		<BoxedCard>
			<CardContent className="flex flex-1 flex-col items-center justify-center pt-6 md:pt-0">
				<div className="mb-2 flex flex-col items-center justify-center gap-1">
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
					Take control of your crypto payments with advanced priority settings.
					Configure preferences for EVM networks with our flexible three-tier
					system. Enjoy seamless, secure transactions tailored to your needs.
				</p>
			</CardContent>
		</BoxedCard>
	);
}
