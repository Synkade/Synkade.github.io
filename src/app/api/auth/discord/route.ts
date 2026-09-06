import { NextRequest, NextResponse } from "next/server";

// Cloudflare Pages Functions requiere el runtime "edge" para Next.js
// route handlers (no soporta el runtime "nodejs" por defecto de Next).
export const runtime = "edge";

/**
 * Redirige al usuario a la pantalla de autorización de Discord.
 * Variables de entorno necesarias (configuradas como Secrets en
 * Cloudflare Pages, ver README):
 *  - DISCORD_CLIENT_ID
 *  - DISCORD_REDIRECT_URI  (debe coincidir EXACTO con lo registrado
 *    en el Discord Developer Portal, incluyendo protocolo y path)
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error:
          "Discord OAuth is not configured. Set DISCORD_CLIENT_ID and DISCORD_REDIRECT_URI.",
      },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
  });

  return NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`
  );
}
