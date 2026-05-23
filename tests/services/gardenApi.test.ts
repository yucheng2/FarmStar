import { describe, expect, it } from 'vitest'
import {
  createAdoption,
  getCaretakerById,
  getCaretakers,
  getFields,
  getRecommendedCaretakers,
  getStoredAdoption
} from '../../src/services/gardenApi'


describe('gardenApi', () => {
  it('filters fields by status and keyword', async () => {
    const result = await getFields({ status: 'idle', keyword: '田地001' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].code).toBe('田地001')
    expect(result.items[0].status).toBe('idle')
  })

  it('returns recommended caretakers within three kilometers sorted by rating, experience, positive rate, and distance', async () => {
    const result = await getRecommendedCaretakers('field-001')

    expect(result.items.map((caretaker) => caretaker.id)).toEqual(['caretaker-zhang', 'caretaker-li', 'caretaker-wang'])
    expect(result.items.every((caretaker) => caretaker.distanceKm !== undefined && caretaker.distanceKm <= 3)).toBe(true)
  })

  it('filters caretakers by rating, experience, and specialty', async () => {
    const result = await getCaretakers({ ratingMin: 4.5, experienceRange: '5_plus', specialty: 'vegetable' })

    expect(result.items.map((caretaker) => caretaker.id)).toEqual(['caretaker-zhang', 'caretaker-li'])
  })

  it('returns caretaker details by id', async () => {
    const caretaker = await getCaretakerById('caretaker-zhang')

    expect(caretaker.name).toBe('张叔')
    expect(caretaker.realPhotoUrl).toBe('/static/caretakers/zhang-real.webp')
  })

  it('creates a pending payment adoption and stores it for payment confirmation', async () => {
    const adoption = await createAdoption({ fieldId: 'field-001', caretakerId: 'caretaker-zhang' })
    const stored = getStoredAdoption(adoption.adoptionId)

    expect(adoption.status).toBe('pending_payment')
    expect(adoption.nextUrl).toBe('/pages/payment/confirm?adoption_id=adoption-field-001-caretaker-zhang')
    expect(stored?.fieldId).toBe('field-001')
    expect(stored?.caretakerId).toBe('caretaker-zhang')
  })

  it('rejects adoption creation when field is not idle', async () => {
    await expect(createAdoption({ fieldId: 'field-002', caretakerId: 'caretaker-zhang' })).rejects.toThrow('该田地已不可认养')
  })
})
