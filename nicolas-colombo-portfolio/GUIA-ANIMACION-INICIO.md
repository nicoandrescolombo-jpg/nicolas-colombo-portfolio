# GUÍA TÉCNICA: ANIMACIÓN DE PORTADA (HERO SECTION)
**Portafolio Profesional de Nicolas Colombo — Animator 2D**

---

## 1. INTRODUCCIÓN

La portada del portafolio es la primera impresión visual para estudios de animación, directores de arte y colaboradores. Ocupa el **100% del alto visible del navegador** (`100svh`) y utiliza un archivo de video original en bucle como fondo cinematográfico sobre el que se superpone la identidad: **Nicolas Colombo — Animator 2D**.

Esta guía detalla las especificaciones técnicas, relaciones de aspecto, zonas seguras y el procedimiento para exportar y reemplazar la pieza desde el panel de administración.

---

## 2. ESPECIFICACIONES TÉCNICAS DEL ARCHIVO

| Parámetro | Recomendación Ideal | Rango Aceptado |
| :--- | :--- | :--- |
| **Formato contenedor** | `.mp4` | `.mp4`, `.webm` |
| **Códec de video** | **H.264** (AVC) | H.264 o VP9 |
| **Perfil H.264** | High Profile / Level 4.1 o 4.2 | Baseline, Main, High |
| **Resolución Desktop** | **1920 × 1080 px** (Full HD) | 1280×720 hasta 2560×1440 |
| **Relación de aspecto Desktop** | **16:9** horizontal | 16:9 |
| **Resolución Mobile (opcional)** | **1080 × 1920 px** (Vertical) | 720×1280 hasta 1080×1920 |
| **Relación de aspecto Mobile** | **9:16** vertical | 9:16 |
| **Frecuencia de cuadros (FPS)**| **24 fps** (estándar cine animación) | 24 o 30 fps |
| **Duración del loop** | **6 a 12 segundos** (bucle perfecto) | 4 a 20 segundos |
| **Audio** | **Sin pista de audio** (Mute/Strip) | Si contiene audio, el navegador lo silenciará automáticamente |
| **Tasa de bits (Bitrate)** | **6 a 10 Mbps** (VBR 2-pass) | Máx 15 Mbps |
| **Peso máximo del archivo** | **< 15 MB** (ideal 5 a 10 MB) | Límite del sistema: 50 MB |
| **Imagen de respaldo (Poster)** | **1920 × 1080 px en .webp o .jpg** | Peso < 400 KB |

---

## 3. ADAPTACIÓN DE PANTALLA Y COMPORTAMIENTO (COVER VS CONTAIN)

La web implementa `object-fit: cover` con alto `100svh`:
- El video llenará toda la pantalla sin importar si la ventana es ultrawide (21:9), estándar (16:9) o vertical (teléfonos).
- Para evitar deformaciones o barras negras, **los bordes exteriores se recortan dinámicamente** cuando el ratio del monitor no coincide con el del video.
- En dispositivos móviles, si no se sube un video vertical específico, el video horizontal centrado recortará los laterales izquierdo y derecho.

---

## 4. DIAGRAMA DE ZONAS SEGURAS (SAFE AREA)

En una resolución de referencia de **1920 × 1080 px**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1920 x 1080 (Área Total del Video)                                     │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │  Área visible en pantallas Ultra-Wide (recorte vertical)           │ │
│ │  ┌──────────────────────────────────────────────────────────────┐  │ │
│ │  │                                                              │  │ │
│ │  │              [ N A V I G A C I Ó N   S U P E R I O R ]       │  │ │
│ │  │                                                              │  │ │
│ │  │   ┌──────────────────────────────────────────────────────┐   │  │ │
│ │  │   │                                                      │   │  │ │
│ │  │   │               ZONA SEGURA PRINCIPAL                  │   │  │ │
│ │  │   │            (Centro 1200 x 650 píxeles)               │   │  │ │
│ │  │   │                                                      │   │  │ │
│ │  │   │                 Nicolas Colombo                      │   │  │ │
│ │  │   │                   Animator 2D                        │   │  │ │
│ │  │   │                                                      │   │  │ │
│ │  │   └──────────────────────────────────────────────────────┘   │  │ │
│ │  │                                                              │  │ │
│ │  │                [ I N D I C A D O R   S C R O L L ]           │  │ │
│ │  │                                                              │  │ │
│ │  └──────────────────────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ Recorte en pantallas móviles si se usa video horizontal (centro 600px) │
└────────────────────────────────────────────────────────────────────────┘
```

### Reglas de composición:
1. **Acción principal / Puntos focales:** Ubicar a los personajes u objetos en movimiento dentro del recuadro central de **1200 × 650 px**.
2. **Bordes:** No colocar detalles esenciales en los 150 px superiores/inferiores ni en los 300 px laterales.
3. **Contraste:** La web superpone un velo degradado oscuro sutil (`rgba(0,0,0, 0.4)`) editable desde el panel para garantizar que el texto blanco se lea con nitidez tanto sobre fondos claros como oscuros.

---

## 5. CÓMO EXPORTAR DESDE SOFTWARE DE ANIMACIÓN

### Desde Adobe After Effects / Adobe Media Encoder:
1. Menú **Composición > Añadir a la cola de procesamiento / Media Encoder**.
2. Formato: **H.264**.
3. Ajuste preestablecido: **Coincidir con origen - Velocidad de bits media** (Match Source - Adaptive Medium Bitrate).
4. En la pestaña **Video**:
   - Codificación de velocidad: **VBR, 2 pases**.
   - Velocidad de destino: **8 Mbps**.
   - Velocidad máxima: **12 Mbps**.
   - Desmarcar la casilla de **Audio** para evitar peso innecesario.
5. Exportar también un fotograma clave representativo como imagen **JPG** o **PNG** a 1920×1080 (servirá de imagen de respaldo / poster).

### Desde Blender / Toon Boom Harmony / TVPaint:
1. Exportar la secuencia en ProRes o PNG sin pérdida.
2. Comprimir la copia final con **HandBrake** (gratuito) o **FFmpeg** utilizando:
```bash
ffmpeg -i render_master.mov -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -b:v 8M -maxrate 12M -bufsize 16M -an hero_loop.mp4
```

---

## 6. CÓMO REEMPLAZAR LA ANIMACIÓN DESDE EL PANEL DE ADMINISTRACIÓN

1. Acceder a `/admin` e iniciar sesión con las credenciales de Nicolas.
2. En el menú lateral, seleccionar **Portada / Hero**.
3. En la sección **Video Principal (Desktop)**:
   - Hacer clic en *Seleccionar archivo* o arrastrar el nuevo `.mp4`.
   - Se validará el peso y formato automáticamente.
4. En la sección **Versión Móvil (Opcional)**:
   - Puedes subir un video vertical 9:16 recortado a medida para celulares. Si no se sube, se adaptará el video de escritorio.
5. En la sección **Imagen de Respaldo (Fallback / Poster)**:
   - Subir el fotograma clave estático para conexiones lentas o dispositivos con ahorro de datos activado.
6. Ajustar el deslizador de **Opacidad de Capa Oscura** (entre 20% y 60%) según la claridad de tu animación.
7. Presionar **Guardar y Publicar Cambios**. La actualización se refleja inmediatamente en la portada pública.
