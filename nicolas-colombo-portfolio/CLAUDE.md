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

## Diseño (28/10/2026, orientado a conseguir trabajo en estudios)
Dirección: cine y animación de autor (LAIKA, Ghibli, el Nosferatu de Eggers, que inspiró el logo). Limpio, monocromo, sin adornos de interfaz.
- Sitio público en **inglés** (el admin sigue en español).
- Paleta "copia en blanco y negro": fondo `#000` (ink) · texto hueso `#E8E2D6` (paper) · gris cálido `#9A948A` (lead) · panel `#121110` (graphite) · líneas `#2A2825` (rule). Sin color de acento: el único color es el de las animaciones.
- Tipografía: **Alegreya** (serif caligráfica de pluma ancha, como el logo) + **Alegreya SC** (versalitas reales) para menú, botones, rótulos y créditos. Clases propias en `globals.css`: `.type-display`, `.type-body`, `.type-sc`, `.figures` (no usar `font-*` en el sitio público: chocan con Tailwind).
- Logo: `public/nicolas-colombo-wordmark.svg` (vector recortado). Favicon: `src/app/icon.svg` (la N del logo).
- Hero en **letterbox 2:1** (franjas negras arriba y abajo, solo en pantallas apaisadas ≥768px): el menú vive en la franja de arriba, la disponibilidad en la de abajo.
- Logo con "boil" (3 dibujos de filtro SVG alternados cada 2 cuadros; solo desktop, respeta reduced motion) y entrada "en dos" (CSS `steps()` a 12 fps). No agregar otras animaciones automáticas.
- About armado como **créditos finales** (centrado, rol en versalitas a la izquierda, dato a la derecha).
- Contacto: email grande + formulario con forma de encabezado de hoja de exposición (X-sheet), en líneas finas color hueso.
- Pixel art: los GIF ≤ 400 px se agrandan en múltiplos enteros y sin suavizado (`AnimatedImage.tsx`), dentro de un panel con marcas de encuadre muy tenues (`FieldGuide.tsx`) y un epígrafe con nombre de archivo, tamaño real y escala.
- `TimingChart.tsx`: carta de timing tenue en el borde inferior del header (home) como progreso de lectura; las secciones son las keys.
- Se descartó: azul de lápiz, rojo tipo "REC", reglas y textos superpuestos tipo visor de cámara, letra gótica en títulos (compite con el logo).
- Admin `/admin/profile` (Perfil y reel): rol, disponibilidad, bio, ubicación, herramientas, link al CV y al reel. Campo inexistente = texto por defecto; campo vacío = se oculta.
- Respaldo del diseño anterior: `_respaldo-diseno-anterior.zip` en esta carpeta.
- Ojo en desarrollo: si se cambia `tailwind.config.ts` con `npm.cmd run dev` corriendo, hay que reiniciar el servidor para ver los cambios.

## Cosas a tener en cuenta
- Supabase (plan free) se pausa tras 7 días sin uso: dashboard → Restore project.
- `onboarding@resend.dev` solo envía al email dueño de la cuenta de Resend.
- `revalidatePath` y OpenNext tiran warnings en Windows/edge, pero funcionan.
- El logo SVG pesa 163 KB (PNG embebido en base64, canvas 1280×720).

---

## Estado al 28/10/2026 (borrar esta sección cuando esté resuelto)

### Mail del formulario: resuelto el 28/10
- Funciona con la key nueva de Resend. `email.ts` registra el resultado en `wrangler tail`: `Mail enviado con Resend. ID: …`, `Resend rechazó el envío: …` o `RESEND_API_KEY no configurada…`.
- Los mails llegan a **spam** en Gmail porque salen de `onboarding@resend.dev`. Nico debe marcarlos "No es spam" o crear un filtro. La solución de fondo es verificar un dominio propio en Resend.
- Pendiente de Nico: borrar la key vieja en Resend. `.env.local` se modificó el 28/10 y tiene una key válida, pero falta confirmar que es la nueva: si sigue funcionando después de borrar la vieja, lo es.
- Si el formulario muestra "Respuesta inesperada del servidor" justo después de un deploy, es una página vieja en caché (el ID de la server action cambia en cada build). Se arregla con Ctrl+F5.

### Rotación de credenciales de Cloudflare
- Se hizo `npx wrangler login`; el deploy ya no usa token.
- El 28/10 Nico avisó que borró el token de Cloudflare (se asume que el viejo, **"Edit Cloudflare Workers"**). No hace falta crear otro.
- **"nicolas-colombo-portfolio build token"** se conserva: parece ser el de Workers Builds. Se puede verificar en Workers & Pages → nicolas-colombo-portfolio → Settings → Build.

### GitHub: al día desde el 30/10, con el rediseño incluido
- `_respaldo-diseno-anterior.zip` y `.claude/` son solo locales (están en `.gitignore`).
- La raíz git es la carpeta padre (`Pagina web/`), no esta. Las rutas en git empiezan con `nicolas-colombo-portfolio/`.
- GitHub tiene **push protection**: rechaza pushes con secretos. El 28/10 bloqueó uno porque un commit viejo incluía `.open-next/` con la key de Resend adentro. Se reescribió el historial local antes de subir. `.open-next/`, `.wrangler/` y `.dev.vars` ya están en `.gitignore`.

### Rediseño: publicado el 30/10/2026 (versión `7e502e4d`)
- En Admin → Perfil y reel: cambiar el rol a "2D Animator", cargar ubicación, herramientas, link al CV y revisar la bio.

### Siguiente objetivo de Nico
Subir contenido nuevo a la página desde el panel admin (portadas propias en cada proyecto: la miniatura automática de Vimeo es de baja resolución).

### Ideas que quedaron sugeridas (sin decidir)
- Tarea programada que consulte Supabase cada pocos días para que no se pause.
- Dominio propio conectado al Worker.
- Verificar un dominio en Resend para poder mandar mails a otros destinatarios.
