
import React from 'react'
import { useStore } from '@nanostores/react'
import { carrito, toggleCarrito } from '../../store/carrito'

export default function ContadorCarrito() {
  const items = useStore(carrito)
  const total = items.reduce((sum, p) => sum + p.cantidad, 0)

  return (
    <button
      onClick={toggleCarrito}
      className="relative flex items-center gap-2 px-4 py-2 text-[#0E2346] hover:text-[#F47920] transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span className="text-xs font-semibold uppercase tracking-wider">Carro</span>
      {total > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#F47920] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {total}
        </span>
      )}
    </button>
  )
}