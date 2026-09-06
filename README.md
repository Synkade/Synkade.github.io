# Dance Hub — Web

Sitio de la comunidad: paquetes, IDs de canciones, leaderboards y
moderación. Next.js (App Router) + TypeScript, desplegado en Cloudflare
Pages, con Cloudflare D1 (base de datos) y R2 (almacenamiento de
paquetes y videos de moderación). Autenticación vía Discord OAuth2.

Este proyecto es un **esqueleto funcional**: la estructura, el tema
claro/oscuro, la navegación, el esquema de base de datos y el flujo de
login ya funcionan. Las partes marcadas con `TODO` (subida real de
paquetes, cálculo de conflictos de ID, cola de moderación con datos
reales) son las siguientes piezas a implementar.

---

## 0. Requisitos previos

- Node.js 18 o superior
- Una cuenta de [Cloudflare](https://dash.cloudflare.com/sign-up) (gratis)
- Una cuenta de [Discord Developer Portal](https://discord.com/developers/applications)
- `npm install -g wrangler` (CLI de Cloudflare)

---

## 1. Instalación local

```bash
npm install
cp .env.example .env.local
```

Rellena `.env.local` con tus valores (ver sección 3 para Discord).

```bash
npm run dev
```

Abre `http://localhost:3000`. En este modo, las páginas que dependen de
D1/R2 (perfil, moderación, subida) no van a funcionar completamente
todavía porque los bindings de Cloudflare no existen en `next dev` puro
— para probar eso necesitas el modo de la sección 5 (`pages:dev`).

---

## 2. Crear la base de datos (Cloudflare D1)

```bash
wrangler login
wrangler d1 create dance_hub_db
```

Esto imprime un `database_id`. Cópialo y pégalo en `wrangler.toml`,
reemplazando `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

Aplica el esquema (tablas: users, packages, package_versions, song_ids,
id_conflicts, reservations, scores, score_submissions, moderation_log,
moderators, player_pp, package_screenshots):

```bash
# Local (para probar con `wrangler pages dev`)
npm run db:migrate:local

# Remoto (base de datos real en Cloudflare)
npm run db:migrate:remote
```

Si más adelante cambias el esquema, crea un nuevo archivo
`db/migrations/00X_descripcion.sql` con solo los cambios (`ALTER TABLE`,
nuevas tablas) en vez de editar `schema.sql` directamente, y corre ese
archivo con el mismo comando `wrangler d1 execute ... --file=...` — así
mantienes un historial de migraciones aplicable en orden.

---

## 3. Crear los buckets de almacenamiento (Cloudflare R2)

```bash
wrangler r2 bucket create dance-hub-packages
wrangler r2 bucket create dance-hub-moderation-videos
```

- `dance-hub-packages`: público (o servido a través de un Worker/route
  que genera URLs firmadas) — aquí van los `.bin` de los paquetes.
- `dance-hub-moderation-videos`: **privado**, nunca expuesto con URL
  pública directa — solo el panel de moderación (protegido por sesión +
  rol) debe poder generar acceso temporal a estos archivos.

Los nombres ya están declarados en `wrangler.toml` bajo `r2_buckets`.

---

## 4. Registrar la app de Discord (OAuth)

1. Ve a https://discord.com/developers/applications → "New Application".
2. En "OAuth2" → "General", copia el **Client ID** y genera/copia el
   **Client Secret**.
3. En "OAuth2" → "Redirects", agrega:
   - Para desarrollo local: `http://localhost:3000/api/auth/callback`
   - Para producción: `https://tu-proyecto.pages.dev/api/auth/callback`
     (o tu dominio final)
4. Pon esos valores en `.env.local` (desarrollo) y como secrets en
   Cloudflare Pages para producción (ver sección 6).

---

## 5. Probar con los bindings de Cloudflare en local

Next.js normal (`npm run dev`) no conoce los bindings de D1/R2 — para
probarlos localmente necesitas compilar para Cloudflare Pages y correr
con `wrangler pages dev`:

```bash
npm run pages:build
npm run pages:dev
```

Esto simula el entorno real de Cloudflare Pages (incluyendo D1 y R2
locales) en tu máquina.

---

## 6. Desplegar a producción

### 6.1 Conectar el repositorio (recomendado, con auto-deploy)

1. Sube este proyecto a un repositorio de GitHub.
2. En el dashboard de Cloudflare → "Workers & Pages" → "Create
   application" → "Pages" → "Connect to Git".
3. Selecciona el repositorio. Configura:
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
4. En "Settings" → "Environment variables", agrega como **secrets**
   (no como variables normales, para que no queden expuestas):
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI` (con tu dominio final de producción)
   - `SESSION_SECRET`
5. En "Settings" → "Functions" → "D1 database bindings" y "R2 bucket
   bindings", conecta `DB`, `PACKAGES_BUCKET` y `MODERATION_BUCKET" a
   los recursos creados en los pasos 2 y 3 (esto es equivalente a lo que
   ya declaraste en `wrangler.toml`, pero Cloudflare también lo pide
   configurado desde el dashboard para el entorno de producción).

Con esto, cada `git push` a la rama principal despliega automáticamente.

### 6.2 Despliegue manual (alternativa sin Git)

```bash
npm run pages:deploy
```

---

## 7. Automatizar con GitHub Actions (rebuild periódico / por webhook)

Como se planteó en el diseño: el sitio puede regenerarse no solo cuando
tú haces push, sino también cuando se publica un paquete nuevo o un post
de noticias. Ejemplo de workflow (`\.github/workflows/rebuild.yml`,
créalo cuando tengas el repo en GitHub):

```yaml
name: Rebuild site
on:
  schedule:
    - cron: "0 */6 * * *"   # cada 6 horas
  repository_dispatch:
    types: [content_updated]
  workflow_dispatch: {}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run pages:build
      - run: npx wrangler pages deploy .vercel/output/static --project-name=dance-hub-web
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Para disparar el `repository_dispatch` desde tu propio backend (por
ejemplo, justo después de aprobar la subida de un paquete), tu Worker
haría un POST autenticado a:
`https://api.github.com/repos/{owner}/{repo}/dispatches`
con `{"event_type": "content_updated"}` en el body, usando un GitHub
Personal Access Token con permiso de `repo`.

---

## 8. Estructura del proyecto

```
src/
  app/
    layout.tsx              Layout raíz (navbar, footer, tema)
    page.tsx                Home
    packages/page.tsx       Lista de paquetes
    packages/[hash]/page.tsx  Detalle de un paquete
    ids/page.tsx             Registro de IDs
    leaderboards/page.tsx    Leaderboards (deshabilitado hasta más adelante)
    docs/page.tsx            Documentación
    login/page.tsx           Redirige a Discord OAuth
    profile/page.tsx         Perfil propio (protegido)
    upload/page.tsx          Subida de paquetes (protegido)
    moderation/page.tsx      Panel de moderación (protegido por rol)
    api/
      auth/discord/route.ts    Inicia OAuth
      auth/callback/route.ts   Recibe el code, crea sesión
      packages/upload/route.ts Subida de paquetes (stub, TODO)
  components/
    Navbar.tsx, Footer.tsx, ThemeToggle.tsx
  lib/
    theme.ts        Lectura de cookie de tema (SSR, sin flash)
    session.ts       Firma/verificación de la cookie de sesión
    moderation.ts     Chequeo de rol de moderador
db/
  schema.sql          Esquema completo de la base de datos D1
wrangler.toml          Config de Cloudflare Pages + D1 + R2
```

---

## 9. Próximos pasos (no implementados aún en este esqueleto)

- Lógica real de `/api/packages/upload`: leer header del `.bin`,
  detectar actualización vs paquete nuevo por `package_hash`, validar
  campos obligatorios de `metadata.txt`, resolver conflictos/reservas de
  IDs, subir a R2, escribir en D1.
- Endpoints de lectura: `/api/packages`, `/api/packages/[hash]`,
  `/api/song-ids`, `/api/leaderboards/[song_id]/[difficulty]`.
- Cola de moderación real (`/api/moderation/queue`,
  `/api/moderation/review/[id]`) con el sistema de lock descrito en el
  diseño (expiración por inactividad, heartbeat).
- Cálculo de star rating / Flow (requiere que el motor del juego calcule
  esto al procesar el `.pld` y lo incluya en los metadatos que se suben).
- Bot de Discord que compone el video de gameplay+cámara y lo sube al
  bucket privado de moderación.
