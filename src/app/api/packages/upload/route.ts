import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";

export const runtime = "edge";

/**
 * TODO (implementación real):
 * 1. Verificar sesión (ya hecho abajo).
 * 2. Leer el archivo del FormData.
 * 3. Leer solo el HEADER del .bin (magic bytes, package_hash, pkg_hdrs,
 *    tabla de índices de song_ids) sin procesar el archivo completo.
 * 4. Resolver si es paquete nuevo o actualización (buscar package_hash
 *    en la tabla `packages` de D1).
 * 5. Validar campos obligatorios de metadata.txt por cada song_id.
 * 6. Revisar conflictos/reservas contra la tabla `song_ids`.
 *    - Si hay conflictos y `confirm` no viene en el FormData -> 409
 *      con la lista de warnings, sin escribir nada aún.
 *    - Si `confirm === "true"` o no hay conflictos -> continuar.
 * 7. Subir el .bin a R2 (bucket público de paquetes).
 * 8. Insertar/actualizar packages, package_versions, song_ids,
 *    id_conflicts según corresponda.
 */
export async function POST(request: NextRequest) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("package");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing package file" }, { status: 400 });
  }

  // Placeholder: aquí iría toda la lógica descrita arriba.
  return NextResponse.json(
    { error: "Upload processing is not implemented yet." },
    { status: 501 }
  );
}
