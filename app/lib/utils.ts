import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function toBoolean(value: string | boolean | undefined | null): boolean {
	if (typeof value === "boolean") return value;
	if (!value) return false;
	return value.toLowerCase() === "true";
}
