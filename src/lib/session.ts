import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const SESSION_COOKIE_NAME = "dh_session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

interface SessionPayload {
  discordId: string;
  username: string;
  exp: number;
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Crea una cookie de sesión firmada (HMAC-SHA256), sin dependencias
 * externas — compatible con el runtime edge de Cloudflare Pages.
 * Para producción real, considera migrar a una librería JWT
 * estándar (ej. `jose`) si el proyecto crece en complejidad.
 */
export async function createSessionCookie(
  data: Omit<SessionPayload, "exp">
): Promise<ResponseCookie> {
  const payload: SessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + ONE_WEEK_SECONDS,
  };
  const payloadStr = base64url(JSON.stringify(payload));
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadStr)
  );
  const token = `${payloadStr}.${base64url(signature)}`;

  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK_SECONDS,
  };
}

/** Verifica y decodifica la cookie de sesión. Devuelve null si es inválida o expiró. */
export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadStr, sigStr] = token.split(".");
  if (!payloadStr || !sigStr) return null;

  try {
    const key = await getKey();
    const expectedSig = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payloadStr)
    );
    const expectedSigStr = base64url(expectedSig);
    if (expectedSigStr !== sigStr) return null;

    const json = atob(payloadStr.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME };
