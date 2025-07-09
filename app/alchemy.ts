import { Alchemy } from "alchemy-sdk";

export const alchemy = new Alchemy({
	apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
});
