import type { LoaderFunctionArgs } from "react-router";
import { signSessionStorage } from "~/lib/cookies/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await signSessionStorage.getSession(
		request.headers.get("Cookie"),
	);

	const signature = session.get("signature");

	if (!signature) {
		// If no signature in session, return empty response
		return Response.json({ signature: null });
	}

	return Response.json({ signature });
}
