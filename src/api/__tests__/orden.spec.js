import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockBackend } = vi.hoisted(() => ({
  mockBackend: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  }
}))

vi.mock('@/api/backendClient', () => ({
  default: mockBackend
}))

import backendClient from '@/api/backendClient'
import ordenApi from '@/api/orden'

describe('orden API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createOrder', () => {
    it('debe enviar el payload con el formato correcto', async () => {
      const orderData = {
        emailContacto: 'test@test.com',
        subtotal: 20000,
        iva: 3800,
        costoEnvio: 5000,
        total: 28800,
        metodoPago: 'webpay',
        items: [
          { id: 1, nombre: 'Polera', precio: 10000, quantity: 2, images: [{ url: 'img.jpg' }] }
        ],
        direccionEnvio: {
          nombreCompleto: 'Juan Test',
          calle: 'Calle 123',
          ciudad: 'Santiago',
          comuna: 'Centro',
          region: 'RM',
          telefono: '123456789'
        }
      }

      backendClient.post.mockResolvedValue({ data: { id: 1, numeroOrden: 'ORD-123' } })

      const result = await ordenApi.createOrder(orderData)

      expect(backendClient.post).toHaveBeenCalledWith('/pedidos', expect.objectContaining({
        emailContacto: 'test@test.com',
        items: expect.arrayContaining([
          expect.objectContaining({
            productoIdStrapi: 1,
            productoNombre: 'Polera',
            precioUnitario: 10000,
            cantidad: 2,
            subtotal: 20000,
            productoImagenUrl: 'img.jpg'
          })
        ]),
        direccionEnvio: expect.objectContaining({
          nombreCompleto: 'Juan Test',
          calle: 'Calle 123'
        })
      }))
      expect(result).toEqual({ id: 1, numeroOrden: 'ORD-123' })
    })

    it('debe propagar el error si la API rechaza por precio cambiado', async () => {
      backendClient.post.mockRejectedValue({
        response: { status: 400, data: { message: 'El precio del producto Polera ha cambiado' } }
      })

      await expect(ordenApi.createOrder({ items: [] })).rejects.toThrow()
    })

    it('debe propagar el error si la API rechaza por stock insuficiente', async () => {
      backendClient.post.mockRejectedValue({
        response: { status: 400, data: { message: 'No hay stock suficiente para Polera' } }
      })

      await expect(ordenApi.createOrder({ items: [] })).rejects.toThrow()
    })
  })

  describe('trackGuestOrder', () => {
    it('debe llamar al endpoint correcto con query params', async () => {
      backendClient.get.mockResolvedValue({ data: { id: 1, numeroOrden: 'ORD-123' } })

      const result = await ordenApi.trackGuestOrder('ORD-123', 'test@test.com')

      expect(backendClient.get).toHaveBeenCalledWith('/pedidos/guest/tracking', {
        params: { numeroOrden: 'ORD-123', emailContacto: 'test@test.com' }
      })
      expect(result).toEqual({ id: 1, numeroOrden: 'ORD-123' })
    })

    it('debe retornar null si la API responde 404', async () => {
      backendClient.get.mockRejectedValue({ response: { status: 404 } })

      const result = await ordenApi.trackGuestOrder('ORD-999', 'x@x.com')
      expect(result).toBeNull()
    })
  })

  describe('updateOrderStatus', () => {
    it('debe enviar PATCH con el estado correcto', async () => {
      backendClient.patch.mockResolvedValue({ data: { id: 1, estado: 'procesando' } })

      const result = await ordenApi.updateOrderStatus(1, 'procesando')

      expect(backendClient.patch).toHaveBeenCalledWith('/pedidos/1/estado', { estado: 'procesando' })
      expect(result.estado).toBe('procesando')
    })
  })
})
