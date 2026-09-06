import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/session";

export const runtime = "edge";

/**
 * Recibe el ?code= de Discord, lo intercambia por un access token,
 * obtiene el perfil del usuario, lo guarda/actualiza en D1 (tabla
 * `users`) y crea la cookie de sesión propia del sitio.
 *
 * Variables de entorno necesarias:
 *  - DISCORD_CLIENT_ID
 *  - DISCORD_CLIENT_SECRET
 *  - DISCORD_REDIRECT_URI
 *  - SESSION_SECRET (para firmar el JWT/cookie de sesión)
 *
 * Binding de Cloudflare necesario:
 *  - DB (D1 database binding, ver wrangler.toml)
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = process.env.DISCORD_REDIRECT_URI!;

  // 1. Intercambiar el código por un access token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: "Failed to exchange code with Discord" },
      { status: 502 }
    );
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };

  // 2. Obtener el perfil del usuario
  const profileRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = (await profileRes.json()) as {
    id: string;
    username: string;
    avatar: string | null;
  };

  const avatarUrl = profile.avatar
    ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
    : null;

  // 3. Insertar/actualizar en D1
  // @ts-expect-error -- `env` lo inyecta el runtime de Cloudflare Pages,
  // ver README para cómo acceder al binding D1 dentro de un route handler.
  const db = process.env.DB ?? globalThis.DB;
  if (db) {
    await db
      .prepare(
        `INSERT INTO users (discord_id, username, avatar_url)
         VALUES (?, ?, ?)
         ON CONFLICT(discord_id) DO UPDATE SET
           username = excluded.username,
           avatar_url = excluded.avatar_url`
      )
      .bind(profile.id, profile.username, avatarUrl)
      .run();
  }

  // 4. Crear cookie de sesión propia
  const sessionCookie = await createSessionCookie({
    discordId: profile.id,
    username: profile.username,
  });

  const response = NextResponse.redirect(new URL("/profile", request.url));
  response.cookies.set(sessionCookie);
  return response;
}
