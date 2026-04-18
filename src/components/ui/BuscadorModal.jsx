import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const base = import.meta.env.BASE_URL

export default function BuscadorModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  // Abrir modal con Ctrl+K o Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Buscar productos
  useEffect(() => {
    if (query.length < 2) {
      setResultados([])
      return
    }

    const buscar = async () => {
      setLoading(true)
      try {
        const wpUrl = 'https://ramsy.cl/admin'
        const consumerKey = 'ck_4bc9a5870b1c8504a3a9a206c783c1aec5af39a3'
        const consumerSecret = 'cs_87087f5cab05a34150e5bf71005ecec341f70b58'
        
        // Usar autenticación básica en headers
        const auth = btoa(`${consumerKey}:${consumerSecret}`)
        
        const response = await fetch(
          `${wpUrl}/wp-json/wc/v3/products?search=${encodeURIComponent(query)}&per_page=10`,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const productos = await response.json()
        
        // Mapear al formato esperado
        const productosFormateados = productos.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          images: p.images,
          sku: p.sku,
          stock_status: p.stock_status
        }))
        
        setResultados(productosFormateados)
      } catch (error) {
        console.error('Error al buscar:', error)
        setResultados([])
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(buscar, 300)
    return () => clearTimeout(timeout)
  }, [query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[600px] flex flex-col">
        
        {/* Header con input */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {/* Ícono de búsqueda */}
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos por nombre, SKU o descripción..."
              className="flex-1 text-lg outline-none text-gray-700 placeholder-gray-400"
            />
            
            {/* Botón cerrar */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Hint */}
          <p className="text-xs text-gray-400 mt-3 ml-10">
            Presiona <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">ESC</kbd> para cerrar
          </p>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F47920]"></div>
            </div>
          )}

          {!loading && query.length >= 2 && resultados.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No se encontraron productos</p>
              <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          )}

          {!loading && resultados.length > 0 && (
            <div className="space-y-2">
              {resultados.map((producto) => (
                <a
                  key={producto.id}
                  href={`${base}/productos/${producto.slug}`}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  {/* Imagen */}
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    <img
                      src={producto.images?.[0]?.src || '/images/placeholder.jpg'}
                      alt={producto.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 group-hover:text-[#F47920] transition-colors truncate">
                      {producto.name}
                    </h4>
                    {producto.sku && (
                      <p className="text-sm text-gray-500 mt-1">SKU: {producto.sku}</p>
                    )}
                  </div>
                  
                  {/* Precio */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-[#0E2346]">
                      ${Number(producto.price).toLocaleString('es-CL')}
                    </p>
                    {producto.stock_status === 'instock' ? (
                      <span className="text-xs text-green-600">Disponible</span>
                    ) : (
                      <span className="text-xs text-red-600">Sin stock</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          {query.length < 2 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 font-medium">Comienza a escribir para buscar</p>
              <p className="text-gray-400 text-sm mt-2">Busca por nombre, SKU o descripción</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// Exportar también el botón para abrir el modal
export function BotonBuscador() {
  const [isOpen, setIsOpen] = useState(false)

  const abrirBuscador = () => {
    setIsOpen(true)
  }

  const cerrarBuscador = () => {
    setIsOpen(false)
  }

  // Escuchar tecla Ctrl+K o Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        onClick={abrirBuscador}
        className="text-gray-700 hover:text-[#F47920] transition-colors p-2"
        aria-label="Buscar"
        type="button"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      
      {isOpen && <BuscadorModalInterno onClose={cerrarBuscador} />}
    </>
  )
}

// Componente interno del modal
function BuscadorModalInterno({ onClose }) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef(null)

  // Verificar que estamos en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus en input cuando se abre
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Buscar productos
  useEffect(() => {
    if (query.length < 2) {
      setResultados([])
      return
    }

    const buscar = async () => {
      setLoading(true)
      try {
        const wpUrl = 'https://ramsy.cl/admin'
        const consumerKey = 'ck_4bc9a5870b1c8504a3a9a206c783c1aec5af39a3'
        const consumerSecret = 'cs_87087f5cab05a34150e5bf71005ecec341f70b58'
        
        // Usar autenticación básica en headers
        const auth = btoa(`${consumerKey}:${consumerSecret}`)
        
        const response = await fetch(
          `${wpUrl}/wp-json/wc/v3/products?search=${encodeURIComponent(query)}&per_page=10`,
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const productos = await response.json()
        
        // Mapear al formato esperado
        const productosFormateados = productos.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          images: p.images,
          sku: p.sku,
          stock_status: p.stock_status
        }))
        
        setResultados(productosFormateados)
      } catch (error) {
        console.error('Error al buscar:', error)
        setResultados([])
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(buscar, 300)
    return () => clearTimeout(timeout)
  }, [query])

  if (!mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/75 cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[600px] flex flex-col">
        
        {/* Header con input */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {/* Ícono de búsqueda */}
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos por nombre, SKU o descripción..."
              className="flex-1 text-lg outline-none text-gray-700 placeholder-gray-400"
            />
            
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Hint */}
          <p className="text-xs text-gray-400 mt-3 ml-10">
            Presiona <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">ESC</kbd> para cerrar
          </p>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F47920]"></div>
            </div>
          )}

          {!loading && query.length >= 2 && resultados.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No se encontraron productos</p>
              <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          )}

          {!loading && resultados.length > 0 && (
            <div className="space-y-2">
              {resultados.map((producto) => (
                <a
                  key={producto.id}
                  href={`${base}/productos/${producto.slug}`}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  onClick={onClose}
                >
                  {/* Imagen */}
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    <img
                      src={producto.images?.[0]?.src || '/images/placeholder.jpg'}
                      alt={producto.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 group-hover:text-[#F47920] transition-colors truncate">
                      {producto.name}
                    </h4>
                    {producto.sku && (
                      <p className="text-sm text-gray-500 mt-1">SKU: {producto.sku}</p>
                    )}
                  </div>
                  
                  {/* Precio */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-[#0E2346]">
                      ${Number(producto.price).toLocaleString('es-CL')}
                    </p>
                    {producto.stock_status === 'instock' ? (
                      <span className="text-xs text-green-600">Disponible</span>
                    ) : (
                      <span className="text-xs text-red-600">Sin stock</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          {query.length < 2 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 font-medium">Comienza a escribir para buscar</p>
              <p className="text-gray-400 text-sm mt-2">Busca por nombre, SKU o descripción</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
