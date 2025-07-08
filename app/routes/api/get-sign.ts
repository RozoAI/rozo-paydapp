import type { LoaderFunctionArgs } from "react-router";
import { signSessionStorage } from "~/lib/cookies/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await signSessionStorage.getSession(
		request.headers.get("Cookie"),
	);
	return Response.json({ signature: session.get("signature") });
}
