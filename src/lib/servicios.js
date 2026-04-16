/**
 * Cliente REST API — Servicios (CPT)
 * Usa la misma WP_URL que WooCommerce (del .env)
 *
 * Endpoint: GET /wp-json/wp/v2/servicios
 *
 * Cada servicio trae:
 *   - title.rendered   → nombre del servicio
 *   - slug             → para la URL
 *   - descripcion_corta → texto de la card (campo ACF)
 *   - imagen_url       → URL directa de la imagen destacada
 */

const WP_URL = import.meta.env.WP_URL || 'http://localhost:10033'

const cache = new Map()

/**
 * Fetch genérico al WP REST API (no necesita auth, es contenido público)
 */
async function wpFetch(endpoint, params = {}) {
  const url = new URL(`${WP_URL}/wp-json/wp/v2/${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value)
    }
  })

  const cacheKey = url.toString()
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`WP REST API ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    cache.set(cacheKey, data)
    return data
  } catch (error) {
    console.error('[Servicios] Error al consultar:', cacheKey)
    console.error(error.message)
    return null
  }
}

// ---------------------------------------------------------------------------
// FUNCIONES PÚBLICAS
// ---------------------------------------------------------------------------

/**
 * Obtener todos los servicios (ordenados por menu_order)
 */
export async function getServicios() {
  const data = await wpFetch('servicios', {
    per_page: 20,
    orderby: 'menu_order',
    order: 'asc',
    _fields: 'id,title,slug,descripcion_corta,imagen_url',
  })
  return data || []
}

/**
 * Obtener un servicio por slug
 */
export async function getServicioBySlug(slug) {
  const data = await wpFetch('servicios', { slug })
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

/**
 * Normaliza un servicio del API al formato que usan los componentes
 */
export function normalizarServicio(servicio) {
  return {
    slug: servicio.slug,
    titulo: servicio.title?.rendered || '',
    descripcion: servicio.descripcion_corta || '',
    imagen: servicio.imagen_url || '',
  }
}
