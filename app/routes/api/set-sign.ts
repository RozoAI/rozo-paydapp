import type { ActionFunctionArgs } from "react-router";
import { signSessionStorage } from "~/lib/cookies/session.server";

export async function action({ request }: ActionFunctionArgs) {
	const session = await signSessionStorage.getSession(
		request.headers.get("Cookie"),
	);

	const body = await request.json();
	const signature = body.signature;

	if (!signature || typeof signature !== "string") {
		return Response.json({ error: "Signature is required" }, { status: 400 });
	}

	session.set("signature", signature);

	return Response.json(
		{ success: true },
		{
			headers: {
				"Set-Cookie": await signSessionStorage.commitSession(session),
			},
		},
	);
}
