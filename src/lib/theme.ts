export type Theme = "light" | "dark";

export const THEME_COOKIE_NAME = "dh_theme";

/**
 * Lee el tema desde el string de cookies del servidor (usado en
 * el layout raiz para renderizar con el tema correcto desde el
 * primer render, sin parpadeo de tema incorrecto).
 */
export function readThemeFromCookieHeader(cookieHeader: string | null): Theme {
  if (!cookieHeader) return "dark";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${THEME_COOKIE_NAME}=`));
  if (!match) return "dark";
  const value = match.split("=")[1];
  return value === "light" ? "light" : "dark";
}
