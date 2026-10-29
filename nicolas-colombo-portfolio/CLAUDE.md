# Portfolio Nicolas Colombo — contexto para Claude Code

Responder siempre en español. Nico trabaja en Windows con PowerShell.

## Reglas
- Nunca escribir keys, tokens ni contraseñas en este archivo ni en ningún archivo del repo. El repo de GitHub es **público**.
- No mostrar el contenido de `.env.local` ni de `.dev.vars`.
- Nico carga las keys él mismo con `npx wrangler secret put NOMBRE`.
- PowerShell no acepta `&&`: usar `;` o comandos separados.
- `npx wrangler tail` corre hasta que se corta con Ctrl+C: correrlo en segundo plano o pedirle a Nico que lo abra en otra ventana.

## Sitio
| | |
|---|---|
| URL pública | https://nicolas-colombo-portfolio.nicoandres-colombo.workers.dev |
| Panel admin | https://nicolas-colombo-portfolio.nicoandres-colombo.workers.dev/admin (login con Supabase Auth) |
| Repo | https://github.com/nicoandrescolombo-jpg/nicolas-colombo-portfolio (rama `master`) |
| Hosting | Cloudflare Workers vía OpenNext |
| Base de datos | Supabase, proyecto `uhizramhxjqzpillmlyv` |
| Cloudflare Account ID | `749cc56cfc341fb3025b44a2eaf1a846` (no es secreto, está en `wrangler.toml`) |

## Stack
Next.js 15.0.3 (App Router) · React 18 · TypeScript · Tailwind 3.4 · Framer Motion 11 · Supabase (`@supabase/ssr`) · Resend 6.32 · `@opennextjs/cloudflare` 1.20 · Wrangler 4.

## Comandos (desde esta carpeta)
- Desarrollo local: `npm.cmd run dev` → http://localhost:3000
- Deploy: `npm run deploy` (build de OpenNext + `wrangler deploy`). Requiere `npx wrangler login` hecho en esta PC (ya está hecho; no se usa token guardado).
- Cambiar un secret: `npx wrangler secret put NOMBRE` (se aplica al instante, sin deploy).
- Ver secrets cargados: `npx wrangler secret list`
- Ver logs en vivo: `npx wrangler tail`

## Variables de entorno
- Local: `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`.
- En el Worker (secrets): las mismas tres.
- Las `NEXT_PUBLIC_*` se fijan en el build: si cambian, hay que volver a hacer deploy.

## Base de datos (Supabase)
- `projects`: id, title, slug (único), description, project_type (`individual` | `gif_sequence`), status (`draft` | `published`), cover_url, sort_order, created_at, updated_at
- `project_media`: id, project_id (FK cascade), media_type (`image` | `gif` | `youtube` | `vimeo`), storage_path, external_url, alt_text, width, height, sort_order
- `site_settings`: id, key (`hero` | `contact` | `identity`), value (JSONB), updated_at
- `clients`: id, name, email, message, created_at
- Buckets de Storage: `hero` (portada) y `projects` (media de proyectos)
- RLS: `site_settings` lectura pública / escritura autenticada; `clients` insert público / lectura autenticada; Storage lectura pública / escritura autenticada.

## Archivos clave
- `src/app/page.tsx`: home pública · `src/app/project/[slug]/page.tsx`: página de proyecto
- `src/app/admin/*`: panel (login, proyectos, hero, contact, clients) · `src/middleware.ts` protege `/admin`
- `src/components/admin/`: HeroForm, ContactForm, ProjectForm
- `src/components/public/`: Hero, Navigation, ProjectCard, GifSequence, ContactSection, PublicContactForm
- `src/lib/actions/projects.ts`: server actions (CRUD y `submitClientInquiry`, que guarda en `clients` y manda el mail)
- `src/lib/utils/email.ts`: `sendInquiryNotification` con Resend (from `onboarding@resend.dev`, to nicoandres.colombo@gmail.com)
- `wrangler.toml`, `open-next.config.ts`: config de Cloudflare

## Diseño
Fondo `#0A0A0A` · texto `#F5F5F5` / `#999999` · acento `#E8FF59` · surfaces `#141414` / `#1A1A1A` · bordes `#252525`.

## Cosas a tener en cuenta
- Supabase (plan free) se pausa tras 7 días sin uso: dashboard → Restore project.
- `onboarding@resend.dev` solo envía al email dueño de la cuenta de Resend.
- `revalidatePath` y OpenNext tiran warnings en Windows/edge, pero funcionan.
- El logo SVG pesa 163 KB (PNG embebido en base64, canvas 1280×720).

---

## Estado al 28/10/2026 (borrar esta sección cuando esté resuelto)

### Mail del formulario: resuelto el 28/10
- Funciona con la key nueva de Resend (deploy versión `a4226597`). `email.ts` registra el resultado en `wrangler tail`: `Mail enviado con Resend. ID: …`, `Resend rechazó el envío: …` o `RESEND_API_KEY no configurada…`.
- Los mails llegan a **spam** en Gmail porque salen de `onboarding@resend.dev`. Nico debe marcarlos "No es spam" o crear un filtro. La solución de fondo es verificar un dominio propio en Resend.
- Pendiente de Nico: borrar la key vieja en Resend y actualizar `RESEND_API_KEY` en `.env.local`.
- Si el formulario muestra "Respuesta inesperada del servidor" justo después de un deploy, es una página vieja en caché (el ID de la server action cambia en cada build). Se arregla con Ctrl+F5.

### Rotación de credenciales de Cloudflare
- Se hizo `npx wrangler login`; el deploy ya no usa token.
- El 28/10 Nico avisó que borró el token de Cloudflare (se asume que el viejo, **"Edit Cloudflare Workers"**). No hace falta crear otro.
- **"nicolas-colombo-portfolio build token"** se conserva: parece ser el de Workers Builds. Se puede verificar en Workers & Pages → nicolas-colombo-portfolio → Settings → Build.

### GitHub: al día desde el 28/10
- La raíz git es la carpeta padre (`Pagina web/`), no esta. Las rutas en git empiezan con `nicolas-colombo-portfolio/`.
- GitHub tiene **push protection**: rechaza pushes con secretos. El 28/10 bloqueó uno porque un commit viejo incluía `.open-next/` con la key de Resend adentro. Se reescribió el historial local antes de subir. `.open-next/`, `.wrangler/` y `.dev.vars` ya están en `.gitignore`.

### Siguiente objetivo de Nico
Subir contenido nuevo a la página desde el panel admin.

### Ideas que quedaron sugeridas (sin decidir)
- Tarea programada que consulte Supabase cada pocos días para que no se pause.
- Dominio propio conectado al Worker.
- Verificar un dominio en Resend para poder mandar mails a otros destinatarios.
