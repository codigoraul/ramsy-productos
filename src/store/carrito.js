import { atom } from 'nanostores'

export const carrito = atom([])
export const carritoAbierto = atom(false)

export function toggleCarrito() {
  carritoAbierto.set(!carritoAbierto.get())
}

export function agregarProducto(producto) {
  const actual = carrito.get()
  const existe = actual.find(p => p.id === producto.id)

  if (existe) {
    carrito.set(actual.map(p =>
      p.id === producto.id
        ? { ...p, cantidad: p.cantidad + 1 }
        : p
    ))
  } else {
    carrito.set([...actual, { ...producto, cantidad: 1 }])
  }
}

export function eliminarProducto(id) {
  carrito.set(carrito.get().filter(p => p.id !== id))
}

export function cambiarCantidad(id, cantidad) {
  if (cantidad < 1) {
    eliminarProducto(id)
    return
  }
  carrito.set(carrito.get().map(p =>
    p.id === id ? { ...p, cantidad } : p
  ))
}

export function vaciarCarrito() {
  carrito.set([])
}