/**
 * Verifica si el usuario (por discord_id) está en la tabla `moderators`.
 * TODO: reemplazar el acceso a `db` por el binding real de D1 disponible
 * en el entorno de Cloudflare Pages (ver README, sección "Bindings").
 */
export async function isModerator(discordId: string): Promise<boolean> {
  // @ts-expect-error -- inyectado por el runtime de Cloudflare Pages
  const db = process.env.DB ?? globalThis.DB;
  if (!db) return false;

  const row = await db
    .prepare(
      `SELECT 1 FROM moderators m
       JOIN users u ON u.id = m.user_id
       WHERE u.discord_id = ?`
    )
    .bind(discordId)
    .first();

  return !!row;
}
