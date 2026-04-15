import React from 'react'
import { useStore } from '@nanostores/react'
import { carrito, carritoAbierto, toggleCarrito, eliminarProducto, cambiarCantidad, vaciarCarrito } from '../../store/carrito'

const WC_URL = import.meta.env.PUBLIC_WC_CHECKOUT_URL || 'http://localhost/wordpress'

export default function CarritoDrawer() {
  const items = useStore(carrito)
  const abierto = useStore(carritoAbierto)

  const total = items.reduce((sum, p) => sum + (p.precio * p.cantidad), 0)

  const irAPagar = () => {
    const params = items.map(p => `${p.id}:${p.cantidad}`).join(',')
    window.location.href = `${WC_URL}/cart/?fill_cart=${params}`
  }

  return (
    <>
      {/* Overlay */}
      {abierto && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleCarrito}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${abierto ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header drawer */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0E2346]">
          <h2 className="font-display text-xl font-bold text-white tracking-wide uppercase">
            Mi Carro
          </h2>
          <button onClick={toggleCarrito} className="text-white hover:text-[#F47920] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">Tu carro está vacío</p>
              <button onClick={toggleCarrito} className="text-xs text-[#F47920] font-semibold uppercase tracking-wider hover:underline">
                Ver productos →
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map(item => (
                <li key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                  {/* Imagen */}
                  {item.imagen && (
                    <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded bg-gray-50" />
                  )}
                  {/* Info */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0E2346] leading-tight">{item.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku || '—'}</p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Cantidad */}
                      <div className="flex items-center border border-gray-200 rounded">
                        <button
                          onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#F47920] transition-colors"
                        >−</button>
                        <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                        <button
                          onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#F47920] transition-colors"
                        >+</button>
                      </div>
                      {/* Precio */}
                      <p className="text-sm font-bold text-[#F47920]">
                        ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                  {/* Eliminar */}
                  <button
                    onClick={() => eliminarProducto(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors self-start mt-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer drawer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total</span>
              <span className="text-xl font-bold text-[#0E2346]">
                ${total.toLocaleString('es-CL')}
              </span>
            </div>
            <button
              onClick={irAPagar}
              className="w-full bg-[#F47920] hover:bg-[#d96a10] text-white font-semibold uppercase tracking-wider text-sm py-3 transition-colors"
            >
              Pagar con WebPay →
            </button>
            <button
              onClick={vaciarCarrito}
              className="w-full text-xs text-gray-400 hover:text-red-400 mt-2 py-1 transition-colors"
            >
              Vaciar carro
            </button>
          </div>
        )}
      </div>
    </>
  )
}