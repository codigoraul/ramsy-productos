// Funciones para el proceso de checkout con WooCommerce

const WP_URL = import.meta.env.WP_URL || 'http://localhost:10033'
const CONSUMER_KEY = import.meta.env.WC_CONSUMER_KEY
const CONSUMER_SECRET = import.meta.env.WC_CONSUMER_SECRET

/**
 * Crear una orden en WooCommerce desde el carrito de Astro
 */
export async function createWooCommerceOrder(cartItems, customerData) {
  try {
    // Formatear los items del carrito para WooCommerce
    const lineItems = cartItems.map(item => ({
      product_id: parseInt(item.id),
      quantity: item.quantity
    }))

    // Datos de la orden
    const orderData = {
      payment_method: 'transbank', // ID del método de pago de Transbank
      payment_method_title: 'WebPay Plus',
      set_paid: false, // No marcar como pagada hasta que Transbank confirme
      billing: {
        first_name: customerData.firstName || '',
        last_name: customerData.lastName || '',
        address_1: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        postcode: customerData.postcode || '',
        country: customerData.country || 'CL',
        email: customerData.email || '',
        phone: customerData.phone || ''
      },
      shipping: {
        first_name: customerData.firstName || '',
        last_name: customerData.lastName || '',
        address_1: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        postcode: customerData.postcode || '',
        country: customerData.country || 'CL'
      },
      line_items: lineItems,
      shipping_lines: [
        {
          method_id: 'flat_rate',
          method_title: 'Envío estándar',
          total: '0' // Ajustar según tus necesidades
        }
      ]
    }

    // Determinar si usar query params (HTTP) o headers (HTTPS)
    const useQueryAuth = WP_URL.startsWith('http://') && !WP_URL.startsWith('https://')
    
    let url = `${WP_URL}/wp-json/wc/v3/orders`
    
    // Si es HTTP local, agregar credenciales como query params
    if (useQueryAuth) {
      url += `?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`
    }

    const headers = {
      'Content-Type': 'application/json'
    }

    // Si es HTTPS, usar Basic Auth
    if (!useQueryAuth) {
      headers['Authorization'] = 'Basic ' + btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Error al crear orden: ${error.message || response.statusText}`)
    }

    const order = await response.json()
    return order

  } catch (error) {
    console.error('Error en createWooCommerceOrder:', error)
    throw error
  }
}

/**
 * Obtener URL de pago de Transbank para una orden
 */
export function getTransbankPaymentUrl(orderId) {
  // La URL de pago de WooCommerce con Transbank
  return `${WP_URL}/checkout/order-pay/${orderId}/?pay_for_order=true&key=wc_order_${orderId}`
}

/**
 * Redirigir al checkout de WooCommerce con los productos del carrito
 * Esta es una alternativa más simple que crea la orden directamente en WooCommerce
 */
export function redirectToWooCommerceCheckout(cartItems) {
  // Construir URL con los productos como parámetros
  const params = new URLSearchParams()
  
  cartItems.forEach((item, index) => {
    params.append(`add-to-cart[${index}]`, item.id)
    params.append(`quantity[${index}]`, item.quantity.toString())
  })
  
  const checkoutUrl = `${WP_URL}/checkout/?${params.toString()}`
  window.location.href = checkoutUrl
}

/**
 * Agregar productos al carrito de WooCommerce vía AJAX
 * y luego redirigir al checkout
 */
export async function addToWooCommerceCartAndCheckout(cartItems) {
  try {
    // Primero, agregar cada producto al carrito de WooCommerce
    for (const item of cartItems) {
      const formData = new FormData()
      formData.append('product_id', item.id)
      formData.append('quantity', item.quantity)
      
      await fetch(`${WP_URL}/?wc-ajax=add_to_cart`, {
        method: 'POST',
        body: formData
      })
    }
    
    // Redirigir al checkout de WooCommerce
    window.location.href = `${WP_URL}/checkout/`
    
  } catch (error) {
    console.error('Error al agregar productos al carrito de WooCommerce:', error)
    throw error
  }
}
