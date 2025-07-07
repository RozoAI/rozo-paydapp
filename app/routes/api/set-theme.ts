import { createThemeAction } from "remix-themes";
import { themeSessionResolver } from "~/lib/cookies/theme.server";

export const action = createThemeAction(themeSessionResolver);
