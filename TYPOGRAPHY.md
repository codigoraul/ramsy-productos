# Sistema Tipográfico — Ramsy

## Fuente: IBM Plex Sans

**Por qué IBM Plex Sans:**
- ✅ Precisión técnica: diseñada por IBM para comunicar autoridad y exactitud
- ✅ Números impecables: ideal para specs, modelos, rangos de medición
- ✅ Legibilidad técnica: usada en manuales y catálogos de instrumentación europea
- ✅ Profesionalismo industrial: misma familia que usa IBM, Red Hat, y fabricantes de instrumentación

## Pesos utilizados

### Títulos (H1, H2, H3)
- **Weight 600 (Semibold)**: Autoridad técnica sin gritar
- Transmite confianza y profesionalismo
- Perfecto para títulos de secciones y páginas

### Cuerpo de texto
- **Weight 400 (Regular)**: Texto principal, descripciones
- **Weight 300 (Light)**: Textos secundarios, subtítulos suaves
- Sensación de manual técnico bien diseñado

### Énfasis
- **Weight 500 (Medium)**: Labels, categorías, navegación
- **Weight 700 (Bold)**: Números destacados, CTAs (uso mínimo)

## Escala tipográfica

```css
/* Base */
html: 16px (óptimo para IBM Plex Sans)
body: 400, line-height 1.65

/* Títulos */
H1: clamp(2.5rem, 5.5vw, 4.5rem) — weight 600
H2: clamp(2rem, 4vw, 3.25rem) — weight 600
H3/H4: definido por componente vía Tailwind

/* Párrafos */
p: line-height 1.7
```

## Aplicación en componentes

### Hero
- Título: weight 600, tamaño grande
- Subtítulo: weight 300 (light), legibilidad

### Servicios/Productos
- Títulos de tarjeta: weight 600
- Descripciones: weight 400
- Labels: weight 500

### Navegación
- Links: weight 400 (normal)
- Hover: sin cambio de peso, solo color

### Footer
- Títulos: weight 500 (medium)
- Links: weight 300 (light)

## Números y datos técnicos

IBM Plex Sans tiene números **tabulares** perfectos para:
- Especificaciones técnicas
- Rangos de medición
- Modelos de productos
- Precios
- Códigos de producto

Ejemplo:
```
Rango: 0-100 PSI
Modelo: XTR-2500
Precisión: ±0.5%
```

## Contraste y jerarquía

- **Títulos principales**: #0E2346 (navy dark) — weight 600
- **Texto cuerpo**: #1a1a1a — weight 400
- **Texto secundario**: gray-500/600 — weight 300
- **Acentos**: #F47920 (orange) — weight 500/600

## Recomendaciones

1. ✅ Usar weight 600 para todos los títulos (no 700)
2. ✅ Weight 300 para textos secundarios y footer
3. ✅ Weight 400 como base para todo el cuerpo
4. ✅ Weight 500 para navegación y labels
5. ❌ Evitar weight 700 excepto en números destacados muy específicos
6. ❌ No mezclar con otras fuentes (mantener IBM Plex Sans en todo)
