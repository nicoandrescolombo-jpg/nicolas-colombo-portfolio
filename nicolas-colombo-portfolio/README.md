# Nicolas Colombo — Animator 2D Portfolio

Portafolio digital y plataforma editorial para **Nicolas Colombo**, animador 2D. Diseñado con una dirección de arte minimalista, oscura y de alto impacto visual, enfocado en mostrar obras de animación tradicional y digital a estudios, clientes y directores de arte.

---

## 🎨 Características Principales

1. **Portada Cinemática a Pantalla Completa (Hero Section):**
   - Ocupa el 100% de la ventana (`100svh`), adaptándose a monitores ultrawide, pantallas estándar y dispositivos móviles sin desbordes.
   - Reproduce un video original en bucle con compresión H.264 sin audio para carga ultrarrápida.
   - Capa de contraste regulable y soporte para versión móvil vertical (9:16) y poster estático de respaldo.
   - Cumple con estándares de accesibilidad y `prefers-reduced-motion`.

2. **Galería Asimétrica con 2 Tipos de Publicación:**
   - **Tipo A (Proyecto Individual):** Soporta video de YouTube y Vimeo con reproductores oficiales bajo demanda (click-to-play para máximo rendimiento), e imágenes estáticas con sus proporciones originales.
   - **Tipo B (Secuencia de GIFs):** Diseñado específicamente para *walk cycles*, estudios de peso y pruebas de animación. Renderiza secuencias verticales continuas con lazy loading e inmunidad a layout shift (CLS).

3. **Panel Privado de Administración (`/admin`):**
   - Autenticación protegida con Supabase Auth (sin registros públicos abiertos).
   - Gestión integral de publicaciones (Crear, Editar, Guardar Borrador, Publicar, Eliminar).
   - Carga directa de animaciones y posters a Supabase Storage con URL pública automática.
   - Edición en tiempo real de canales de contacto (Email, Instagram, Behance, LinkedIn) con conmutadores de visibilidad.

4. **Tecnologías:**
   - **Frontend:** Next.js 15 (App Router, Server Components y Server Actions).
   - **Estilos:** Tailwind CSS con tipografía editorial (*Instrument Serif* y *Space Grotesk*).
   - **Animaciones UI:** Framer Motion.
   - **Base de datos & Auth:** Supabase PostgreSQL con Row Level Security (RLS).
   - **Almacenamiento:** Supabase Storage (buckets públicos `hero` y `projects`).

---

## 🚀 Cómo Ejecutar en Desarrollo Local

1. Clona el repositorio e ingresa a la carpeta:
   ```bash
   cd nicolas-colombo-portfolio
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea el archivo `.env.local` en la raíz con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre en tu navegador:
   - Sitio público: [http://localhost:3000](http://localhost:3000)
   - Panel de administración: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📚 Documentación Adicional

- [`GUIA-ANIMACION-INICIO.md`](./GUIA-ANIMACION-INICIO.md): Especificaciones técnicas para la portada (resolución, códec, bitrate, zonas seguras y exportación desde After Effects/FFmpeg).
- [`supabase/schema_completo.sql`](./supabase/schema_completo.sql): Esquema SQL completo con tablas, disparadores y políticas de seguridad RLS.
- [`INSTRUCCIONES-BASE-DE-DATOS.txt`](../INSTRUCCIONES-BASE-DE-DATOS.txt): Guía paso a paso para configurar Supabase.

---

## 🚢 Despliegue en Producción (Vercel)

1. Sube tu código a un repositorio privado de GitHub.
2. Entra a [vercel.com](https://vercel.com) y conecta tu repositorio.
3. En la sección **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Presiona **Deploy**. Vercel compilará y publicará la web automáticamente.
