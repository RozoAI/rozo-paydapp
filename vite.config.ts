import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
		vanillaExtractPlugin(),
	],
	ssr: {
		noExternal: [
			"@vanilla-extract",
			"@vanilla-extract/sprinkles",
			"@rainbow-me/rainbowkit",
		],
	},
	optimizeDeps: {
		exclude: ["@vanilla-extract/sprinkles/createUtils"],
	},
});
