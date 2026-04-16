export const prerender = false

export async function GET({ request }) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''

  if (query.length < 2) {
    return new Response(JSON.stringify({ productos: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const WORDPRESS_URL = import.meta.env.WORDPRESS_URL || 'http://localhost:10033'
    const CONSUMER_KEY = import.meta.env.WC_CONSUMER_KEY
    const CONSUMER_SECRET = import.meta.env.WC_CONSUMER_SECRET

    // Buscar por nombre/descripción
    const responseSearch = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/v3/products?` + 
      `consumer_key=${CONSUMER_KEY}&` +
      `consumer_secret=${CONSUMER_SECRET}&` +
      `search=${encodeURIComponent(query)}&` +
      `per_page=50&` +
      `status=publish`
    )

    // Buscar por SKU
    const responseSku = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/v3/products?` + 
      `consumer_key=${CONSUMER_KEY}&` +
      `consumer_secret=${CONSUMER_SECRET}&` +
      `sku=${encodeURIComponent(query)}&` +
      `per_page=50&` +
      `status=publish`
    )

    if (!responseSearch.ok && !responseSku.ok) {
      throw new Error('Error al buscar productos')
    }

    const productosSearch = responseSearch.ok ? await responseSearch.json() : []
    const productosSku = responseSku.ok ? await responseSku.json() : []

    // Combinar resultados y eliminar duplicados
    const productosMap = new Map()
    
    // Agregar productos por SKU primero (mayor prioridad)
    productosSku.forEach(p => productosMap.set(p.id, p))
    
    // Agregar productos por búsqueda
    productosSearch.forEach(p => {
      if (!productosMap.has(p.id)) {
        productosMap.set(p.id, p)
      }
    })

    const productos = Array.from(productosMap.values()).slice(0, 10)

    return new Response(JSON.stringify({ productos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error en búsqueda:', error)
    return new Response(JSON.stringify({ productos: [], error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
