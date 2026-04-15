# Breadcrumb con Imagen de Fondo

El componente Breadcrumb soporta imágenes de fondo personalizadas para cada página.

## Uso

```astro
<Breadcrumb 
  items={[
    { label: 'Inicio', href: '/' },
    { label: 'Nombre Página' }
  ]}
  title="Título de la Página"
  backgroundImage="/ruta/a/imagen.jpg"
/>
```

## Props

- **items** (requerido): Array de objetos con `label` y `href` opcional
- **title** (opcional): Título grande que se muestra sobre el breadcrumb
- **backgroundImage** (opcional): URL de la imagen de fondo

## Características

- Imagen con overlay oscuro automático para legibilidad
- Gradiente de `#0E2346` (navy) sobre la imagen
- Opacidad de imagen al 30%
- Altura adaptativa:
  - Con título: 280px
  - Sin título: 120px
- Texto blanco sobre fondo oscuro

## Imágenes Recomendadas

Para mejores resultados, usa imágenes que:
- Sean relevantes a la industria (instrumentación, fábricas, equipos)
- Tengan resolución mínima de 1600px de ancho
- No tengan demasiado detalle (el overlay oscurecerá)
- Preferiblemente horizontales

## Ejemplos de Imágenes por Página

### Nosotros
- Tema: Equipo técnico, oficinas, laboratorio
- Actual: `https://images.unsplash.com/photo-1581092160562-40aa08e78837`

### Contacto
- Tema: Comunicación, soporte, atención al cliente
- Actual: `https://images.unsplash.com/photo-1423666639041-f56000c27a9a`

### Productos (futuro)
- Tema: Instrumentos, equipos industriales, tecnología
- Sugerencia: Imágenes de productos reales o equipamiento industrial

### Servicios (futuro)
- Tema: Mantenimiento, instalación, asesoría técnica
- Sugerencia: Técnicos trabajando, equipos en operación

## Dónde Guardar Imágenes Propias

1. **Opción 1 - Carpeta public:**
   ```
   /public/images/breadcrumbs/
   ├── nosotros.jpg
   ├── contacto.jpg
   ├── productos.jpg
   └── servicios.jpg
   ```
   Uso: `backgroundImage="/images/breadcrumbs/nosotros.jpg"`

2. **Opción 2 - CDN externo:**
   - Unsplash (desarrollo)
   - Cloudinary (producción)
   - Tu propio servidor de imágenes

## Optimización

Para producción, asegúrate de:
- Comprimir imágenes (WebP recomendado)
- Usar lazy loading si es necesario
- Tamaño óptimo: 1600x600px
- Peso máximo: 200KB por imagen
