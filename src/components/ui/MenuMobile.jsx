import { useState, useEffect } from 'react'

const base = import.meta.env.BASE_URL

export default function MenuMobile() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Prevenir scroll cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Botón hamburguesa que se convierte en X */}
      <button
        onClick={toggleMenu}
        className="lg:hidden p-2 text-gray-700 hover:text-[#F47920] transition-colors relative w-10 h-10"
        aria-label="Menú"
        type="button"
      >
        <div className="flex flex-col items-center justify-center w-full h-full">
          <span
            className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? 'opacity-0' : 'mb-1'
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}
          />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Menú lateral desde la izquierda */}
      <div
        className={`fixed top-16 md:top-0 left-0 h-[calc(100vh-64px)] md:h-full w-[280px] bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Links */}
        <nav className="overflow-y-auto h-full py-8">
          <ul className="space-y-0">
            <li>
              <a
                href={base}
                className="block py-4 px-6 text-[#0E2346] hover:bg-[#F47920] hover:text-white transition-all font-medium border-b border-gray-100"
                onClick={toggleMenu}
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                href={`${base}/nosotros`}
                className="block py-4 px-6 text-[#0E2346] hover:bg-[#F47920] hover:text-white transition-all font-medium border-b border-gray-100"
                onClick={toggleMenu}
              >
                Nosotros
              </a>
            </li>
            <li>
              <a
                href={`${base}/servicios`}
                className="block py-4 px-6 text-[#0E2346] hover:bg-[#F47920] hover:text-white transition-all font-medium border-b border-gray-100"
                onClick={toggleMenu}
              >
                Servicios
              </a>
            </li>
            
            <li>
              <a
                href={`${base}/productos`}
                className="block py-4 px-6 text-[#0E2346] hover:bg-[#F47920] hover:text-white transition-all font-medium border-b border-gray-100"
                onClick={toggleMenu}
              >
                Productos
              </a>
            </li>

            <li>
              <a
                href={`${base}/contacto`}
                className="block py-4 px-6 text-[#0E2346] hover:bg-[#F47920] hover:text-white transition-all font-medium border-b border-gray-100"
                onClick={toggleMenu}
              >
                Contacto
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}
