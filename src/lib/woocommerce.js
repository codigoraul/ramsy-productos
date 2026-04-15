/**
 * Cliente WooCommerce REST API
 * Documentación: https://woocommerce.github.io/woocommerce-rest-api-docs/
 *
 * MIGRACIÓN local → producción (cPanel):
 *   Solo cambiar las variables en .env — este archivo no se toca.
 *   Recordar: en producción, WP_URL DEBE ser HTTPS (Basic Auth lo exige).
 */

const WP_URL = import.meta.env.WP_URL || 'http://localhost:10033'
const CONSUMER_KEY = import.meta.env.WC_CONSUMER_KEY
const CONSUMER_SECRET = import.meta.env.WC_CONSUMER_SECRET
const API_VERSION = import.meta.env.WC_API_VERSION || 'wc/v3'

// Validación: si faltan credenciales, avisamos claro (evita errores silenciosos)
if (!CONSUMER_KEY || !CONSUMER_SECRET) {
  console.warn(
    '[WooCommerce] Faltan WC_CONSUMER_KEY o WC_CONSUMER_SECRET en .env — ' +
    'la API no responderá. Revisa tu archivo .env.'
  )
}

// Aviso si HTTP en producción (no-https): Basic Auth expone credenciales en texto plano
if (!WP_URL.startsWith('https://') && !WP_URL.includes('localhost') && !WP_URL.includes('.local')) {
  console.warn(
    '[WooCommerce] ATENCIÓN: estás usando HTTP fuera de localhost. ' +
    'Basic Auth requiere HTTPS en producción para no filtrar las credenciales.'
  )
}

// Determinar si usar query params (HTTP) o headers (HTTPS)
const useQueryAuth = WP_URL.startsWith('http://') && !WP_URL.startsWith('https://')

// Autenticación Basic Auth (solo para HTTPS)
const authHeader = useQueryAuth ? null : 'Basic ' + btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)

// Caché en memoria para el build (Astro SSG)
const cache = new Map()

/**
 * Construye URL con query params
 */
function buildUrl(endpoint, params = {}) {
  const url = new URL(`${WP_URL}/wp-json/${API_VERSION}/${endpoint}`)
  
  // Si es HTTP (localhost), agregar credenciales como query params
  if (useQueryAuth) {
    url.searchParams.append('consumer_key', CONSUMER_KEY)
    url.searchParams.append('consumer_secret', CONSUMER_SECRET)
  }
  
  // Agregar otros parámetros
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value)
    }
  })
  return url.toString()
}

/**
 * Fetch genérico con manejo de errores y caché
 */
async function wcFetch(endpoint, params = {}, { useCache = true } = {}) {
  const url = buildUrl(endpoint, params)

  if (useCache && cache.has(url)) {
    return cache.get(url)
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    // Solo agregar Authorization header si NO estamos usando query params
    if (!useQueryAuth && authHeader) {
      headers.Authorization = authHeader
    }
    
    const response = await fetch(url, { headers })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(
        `WooCommerce API ${response.status}: ${response.statusText}\nURL: ${url}\nBody: ${body}`
      )
    }

    const data = await response.json()

    if (useCache) {
      cache.set(url, data)
    }

    return data
  } catch (error) {
    console.error('[WooCommerce] Error al consultar:', url)
    console.error(error.message)
    return null
  }
}

// ---------------------------------------------------------------------------
// PRODUCTOS
// ---------------------------------------------------------------------------

/**
 * Lista productos con filtros opcionales
 * @param {Object} opts
 * @param {number} opts.perPage - productos por página (default 20, max 100)
 * @param {number} opts.page - número de página
 * @param {number|string} opts.category - ID o slug de categoría
 * @param {string} opts.search - texto de búsqueda
 * @param {string} opts.orderby - date | title | popularity | price
 * @param {string} opts.order - asc | desc
 */
export async function getProductos(opts = {}) {
  const {
    perPage = 20,
    page = 1,
    category,
    search,
    orderby = 'date',
    order = 'desc',
    featured,
  } = opts

  const params = {
    per_page: perPage,
    page,
    orderby,
    order,
    status: 'publish',
  }

  if (category) params.category = category
  if (search) params.search = search
  if (featured !== undefined) params.featured = featured

  const data = await wcFetch('products', params)
  return data || []
}

/**
 * Obtiene un producto por slug
 */
export async function getProductoBySlug(slug) {
  const data = await wcFetch('products', { slug })
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

/**
 * Obtiene un producto por ID
 */
export async function getProductoById(id) {
  return await wcFetch(`products/${id}`)
}

/**
 * Obtiene productos destacados
 */
export async function getProductosDestacados(perPage = 8) {
  return await getProductos({ featured: true, perPage })
}

// ---------------------------------------------------------------------------
// CATEGORÍAS
// ---------------------------------------------------------------------------

/**
 * Lista todas las categorías de productos
 */
export async function getCategorias({ perPage = 100, hideEmpty = true } = {}) {
  const data = await wcFetch('products/categories', {
    per_page: perPage,
    hide_empty: hideEmpty,
    orderby: 'name',
    order: 'asc',
  })
  return data || []
}

/**
 * Obtiene una categoría por slug
 */
export async function getCategoriaBySlug(slug) {
  const data = await wcFetch('products/categories', { slug })
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

// ---------------------------------------------------------------------------
// HELPERS DE FORMATO
// ---------------------------------------------------------------------------

/**
 * Formatea precio en CLP sin decimales
 */
export function formatearPrecio(precio) {
  if (!precio && precio !== 0) return ''
  const n = typeof precio === 'string' ? parseFloat(precio) : precio
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

/**
 * Obtiene la imagen principal de un producto (o placeholder)
 */
export function getImagenProducto(producto, placeholder = '/placeholder-producto.jpg') {
  if (producto?.images && producto.images.length > 0) {
    return producto.images[0].src
  }
  return placeholder
}

/**
 * Limpia HTML de descripciones cortas
 */
export function limpiarHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}
