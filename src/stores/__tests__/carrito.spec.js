import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCarritoStore } from '@/stores/carrito'

describe('CarritoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('debe iniciar vacío', () => {
    const store = useCarritoStore()
    expect(store.items).toEqual([])
    expect(store.cantidadTotal).toBe(0)
  })

  it('debe agregar un producto al carrito', () => {
    const store = useCarritoStore()
    const producto = { id: 1, nombre: 'Polera', precio: 10000 }

    store.agregarAlCarrito(producto)

    expect(store.items).toHaveLength(1)
    expect(store.items[0].producto.id).toBe(1)
    expect(store.items[0].cantidad).toBe(1)
    expect(store.cantidadTotal).toBe(1)
  })

  it('debe incrementar cantidad si el producto ya está en el carrito', () => {
    const store = useCarritoStore()
    const producto = { id: 1, nombre: 'Polera', precio: 10000 }

    store.agregarAlCarrito(producto)
    store.agregarAlCarrito(producto)

    expect(store.items).toHaveLength(1)
    expect(store.items[0].cantidad).toBe(2)
    expect(store.cantidadTotal).toBe(2)
  })

  it('debe calcular el total a pagar correctamente', () => {
    const store = useCarritoStore()
    store.agregarAlCarrito({ id: 1, nombre: 'A', precio: 10000 })
    store.agregarAlCarrito({ id: 2, nombre: 'B', precio: 5000 })
    store.agregarAlCarrito({ id: 1, nombre: 'A', precio: 10000 }) // cantidad 2

    expect(store.totalAPagar).toBe(25000) // 10000*2 + 5000*1
  })

  it('debe disminuir cantidad', () => {
    const store = useCarritoStore()
    store.agregarAlCarrito({ id: 1, nombre: 'A', precio: 10000 })
    store.agregarAlCarrito({ id: 1, nombre: 'A', precio: 10000 })
    store.disminuirCantidad(1)

    expect(store.items[0].cantidad).toBe(1)
    expect(store.cantidadTotal).toBe(1)
  })

  it('debe eliminar un producto del carrito', () => {
    const store = useCarritoStore()
    store.agregarAlCarrito({ id: 1, nombre: 'A', precio: 10000 })
    store.agregarAlCarrito({ id: 2, nombre: 'B', precio: 5000 })
    store.eliminarDelCarrito(1)

    expect(store.items).toHaveLength(1)
    expect(store.items[0].producto.id).toBe(2)
  })

  it('debe vaciar el carrito', () => {
    const store = useCarritoStore()
    store.agregarAlCarrito({ id: 1, nombre: 'A', precio: 10000 })
    store.vaciarCarrito()

    expect(store.items).toEqual([])
    expect(store.cantidadTotal).toBe(0)
  })

  it('debe persistir en localStorage', () => {
    const store = useCarritoStore()
    store.agregarAlCarrito({ id: 1, nombre: 'A', precio: 10000 })

    const guardado = JSON.parse(localStorage.getItem('carrito'))
    expect(guardado).toHaveLength(1)
    expect(guardado[0].producto.id).toBe(1)
  })

  it('debe cargar desde localStorage al iniciar', () => {
    localStorage.setItem('carrito', JSON.stringify([
      { producto: { id: 5, nombre: 'X', precio: 9999 }, cantidad: 3 }
    ]))

    const store = useCarritoStore()
    expect(store.items).toHaveLength(1)
    expect(store.items[0].producto.id).toBe(5)
    expect(store.cantidadTotal).toBe(3)
  })
})
