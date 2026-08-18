import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockBackend } = vi.hoisted(() => ({
  mockBackend: {
    post: vi.fn(),
  }
}))

vi.mock('@/api/backendClient', () => ({
  default: mockBackend
}))

import backendClient from '@/api/backendClient'
import { initTransaction } from '@/api/transbank'

describe('transbank API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe retornar success con token y url si la API responde OK', async () => {
    backendClient.post.mockResolvedValue({
      data: { token: 'tok123', url: 'https://webpay.cl/redirect' }
    })

    const result = await initTransaction('ORD-123')

    expect(backendClient.post).toHaveBeenCalledWith('/transbank/init', { numeroOrden: 'ORD-123' })
    expect(result.success).toBe(true)
    expect(result.token).toBe('tok123')
    expect(result.url).toBe('https://webpay.cl/redirect')
  })

  it('debe retornar success=false con mensaje de error si la API falla', async () => {
    backendClient.post.mockRejectedValue({
      response: { data: { message: 'Pedido no encontrado' } }
    })

    const result = await initTransaction('ORD-999')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Pedido no encontrado')
  })

  it('debe retornar error genérico si no hay response.data.message', async () => {
    backendClient.post.mockRejectedValue(new Error('Network error'))

    const result = await initTransaction('ORD-123')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Error al iniciar la transacción')
  })
})
