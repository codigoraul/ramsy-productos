// Gestión del carrito de compras

export function getCart() {
  if (typeof window === 'undefined') return []
  const cart = localStorage.getItem('ramsy_cart')
  return cart ? JSON.parse(cart) : []
}

export function saveCart(cart) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ramsy_cart', JSON.stringify(cart))
  // Disparar evento personalizado para actualizar el UI
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
}

export function addToCart(producto) {
  const cart = getCart()
  const existingItem = cart.find(item => item.id === producto.id)
  
  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      id: producto.id,
      name: producto.name,
      price: producto.price,
      image: producto.image,
      slug: producto.slug,
      sku: producto.sku,
      quantity: 1
    })
  }
  
  saveCart(cart)
  return cart
}

export function removeFromCart(productId) {
  let cart = getCart()
  cart = cart.filter(item => item.id !== productId)
  saveCart(cart)
  return cart
}

export function updateQuantity(productId, quantity) {
  const cart = getCart()
  const item = cart.find(item => item.id === productId)
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId)
    }
    item.quantity = quantity
    saveCart(cart)
  }
  
  return cart
}

export function clearCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('ramsy_cart')
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }))
}

export function getCartTotal() {
  const cart = getCart()
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
}

export function getCartCount() {
  const cart = getCart()
  return cart.reduce((count, item) => count + item.quantity, 0)
}
