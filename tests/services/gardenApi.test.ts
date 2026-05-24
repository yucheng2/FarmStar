import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAdoption,
  getAdoptionById,
  getCaretakerById,
  getCaretakers,
  getFields,
  getMyAdoptions,
  getRecommendedCaretakers
} from '../../src/services/gardenApi'
import * as authApi from '../../src/services/authApi'

const fetchMock = vi.fn()

describe('gardenApi', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(authApi, 'getToken').mockReturnValue('test-token')
  })

  it('requests fields with status and keyword query', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ code: '田地001', status: 'idle' }], pagination: {} }) })

    const result = await getFields({ status: 'idle', keyword: '田地001' })

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3000/api/fields?status=idle&keyword=%E7%94%B0%E5%9C%B0001', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
      body: undefined
    })
    expect(result.items[0]).toMatchObject({ code: '田地001', status: 'idle' })
  })

  it('requests recommended caretakers', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 'caretaker-zhang' }], pagination: {} }) })

    const result = await getRecommendedCaretakers('field-001')

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3000/api/fields/field-001/recommended-caretakers', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
      body: undefined
    })
    expect(result.items.map((caretaker) => caretaker.id)).toEqual(['caretaker-zhang'])
  })

  it('requests caretakers with filters', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 'caretaker-li' }], pagination: {} }) })

    await getCaretakers({ ratingMin: 4.5, experienceRange: '5_plus', specialty: 'vegetable' })

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3000/api/caretakers?ratingMin=4.5&experienceRange=5_plus&specialty=vegetable', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
      body: undefined
    })
  })

  it('requests caretaker details by id', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'caretaker-zhang', name: '张叔' }) })

    const caretaker = await getCaretakerById('caretaker-zhang')

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3000/api/caretakers/caretaker-zhang', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
      body: undefined
    })
    expect(caretaker.name).toBe('张叔')
  })

  it('posts adoption creation', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        adoptionId: 'adoption-field-001-caretaker-zhang',
        status: 'pending_payment',
        paymentOrderId: 'payment-field-001-caretaker-zhang',
        nextUrl: '/pages/payment/confirm?adoption_id=adoption-field-001-caretaker-zhang'
      })
    })

    const adoption = await createAdoption({ fieldId: 'field-001', caretakerId: 'caretaker-zhang' })

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3000/api/adoptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ fieldId: 'field-001', caretakerId: 'caretaker-zhang' })
    })
    expect(adoption.nextUrl).toBe('/pages/payment/confirm?adoption_id=adoption-field-001-caretaker-zhang')
  })

  it('requests my adoptions', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 'adoption-field-002-caretaker-li' }], pagination: {} }) })

    const result = await getMyAdoptions()

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3000/api/adoptions', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
      body: undefined
    })
    expect(result.items[0].id).toBe('adoption-field-002-caretaker-li')
  })

  it('requests adoption by id', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'adoption-field-001-caretaker-zhang' }) })

    const adoption = await getAdoptionById('adoption-field-001-caretaker-zhang')

    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3000/api/adoptions/adoption-field-001-caretaker-zhang', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
      body: undefined
    })
    expect(adoption.id).toBe('adoption-field-001-caretaker-zhang')
  })

  it('throws backend error message', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ message: '该田地已不可认养' }) })

    await expect(createAdoption({ fieldId: 'field-002', caretakerId: 'caretaker-zhang' })).rejects.toThrow('该田地已不可认养')
  })
})
