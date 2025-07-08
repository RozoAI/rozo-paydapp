import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/(main)/layout.tsx", [index("routes/(main)/home.tsx")]),
	route("api/set-theme", "routes/api/set-theme.ts"),
	route("api/set-sign", "routes/api/set-sign.ts"),
	route("api/get-sign", "routes/api/get-sign.ts"),
] satisfies RouteConfig;
