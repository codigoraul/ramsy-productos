import { useEffect, useState } from 'react'

export default function ContadorCarrito() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Función para actualizar el contador
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('ramsy_cart') || '[]')
      const total = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCount(total)
    }

    // Actualizar al cargar
    updateCount()

    // Escuchar cambios en el carrito
    window.addEventListener('cartUpdated', updateCount)

    return () => {
      window.removeEventListener('cartUpdated', updateCount)
    }
  }, [])

  return (
    <a
      href="/carrito"
      className="relative text-gray-700 hover:text-[#F47920] transition-colors"
      aria-label="Carrito de compras"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#F47920] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </a>
  )
}
