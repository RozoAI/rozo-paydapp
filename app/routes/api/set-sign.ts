import type { ActionFunctionArgs } from "react-router";
import { signSessionStorage } from "~/lib/cookies/session.server";

export async function action({ request }: ActionFunctionArgs) {
	const session = await signSessionStorage.getSession(
		request.headers.get("Cookie"),
	);

	const body = await request.json();
	const { signature } = body;

	// Validate signature matches auth provider requirements
	if (!signature || typeof signature !== "string") {
		return Response.json(
			{ error: "Valid signature is required" },
			{ status: 400 },
		);
	}

	// Store signature in session, matching auth provider login flow
	session.set("signature", signature);

	// Return success response that auth provider expects
	return Response.json(
		{ success: true },
		{
			headers: {
				"Set-Cookie": await signSessionStorage.commitSession(session),
			},
		},
	);
}
