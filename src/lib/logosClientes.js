/**
 * Cliente REST API — Logos clientes (CPT "logo_cliente")
 * Endpoint: GET /wp-json/wp/v2/logos-clientes
 *
 * Se edita en WordPress → Logos clientes:
 *   - título            → nombre del cliente (alt del logo)
 *   - imagen destacada  → logo (llega como logo_url)
 *   - enlace            → web del cliente (opcional)
 *   - orden (Atributos) → posición en el carrusel
 */

const WP_URL = import.meta.env.WP_URL || 'http://localhost:10033'

export async function getLogosClientes() {
  try {
    const url = new URL(`${WP_URL}/wp-json/wp/v2/logos-clientes`)
    url.searchParams.set('per_page', '100')
    url.searchParams.set('orderby', 'menu_order')
    url.searchParams.set('order', 'asc')
    url.searchParams.set('_fields', 'id,title,logo_url,enlace')

    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
    if (!response.ok) throw new Error(`WP REST API ${response.status}: ${response.statusText}`)

    const data = await response.json()
    return data
      .filter((l) => l.logo_url)
      .map((l) => ({
        id: l.id,
        nombre: l.title.rendered.replace(/&amp;/g, '&'),
        logo: l.logo_url,
        url: l.enlace || '',
      }))
  } catch (error) {
    console.warn('[logosClientes] No se pudieron cargar los logos:', error.message)
    return []
  }
}
