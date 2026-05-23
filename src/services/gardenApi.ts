import { caretakers, fields } from '../mocks/gardenData'
import type {
  Adoption,
  Caretaker,
  CaretakerFilters,
  CreateAdoptionInput,
  CreateAdoptionResult,
  ExperienceRange,
  Field,
  FieldFilters,
  PaginatedResult
} from '../types/garden'

const adoptionStore = new Map<string, Adoption>()

function includesKeyword(field: Field, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const caretakerName = field.caretaker?.name ?? ''
  const cropName = field.crop?.name ?? ''

  return [field.code, field.name, caretakerName, cropName]
    .some((value) => value.toLowerCase().includes(normalizedKeyword))
}

function isInExperienceRange(years: number, range: ExperienceRange) {
  if (range === '5_plus') return years >= 5
  if (range === '3_to_5') return years >= 3 && years <= 5
  return years >= 1 && years <= 3
}

export async function getFields(filters: FieldFilters = {}): Promise<PaginatedResult<Field>> {
  const items = fields.filter((field) => {
    if (filters.status && field.status !== filters.status) return false
    if (filters.cropType && !field.crop?.name) return false
    if (filters.caretakerRatingMin && (field.caretaker?.rating ?? 0) < filters.caretakerRatingMin) return false
    if (filters.keyword && !includesKeyword(field, filters.keyword)) return false
    return true
  })

  return { items, pagination: {} }
}

export async function getFieldById(fieldId: string): Promise<Field> {
  const field = fields.find((item) => item.id === fieldId)
  if (!field) throw new Error('田地不存在')
  return field
}

export async function getRecommendedCaretakers(fieldId: string): Promise<PaginatedResult<Caretaker>> {
  await getFieldById(fieldId)

  const items = caretakers
    .filter((caretaker) => caretaker.status === 'active')
    .filter((caretaker) => caretaker.distanceKm !== undefined && caretaker.distanceKm <= 3)
    .sort((left, right) => {
      if (right.rating !== left.rating) return right.rating - left.rating
      if (right.experienceYears !== left.experienceYears) return right.experienceYears - left.experienceYears
      if (right.positiveRate !== left.positiveRate) return right.positiveRate - left.positiveRate
      return (left.distanceKm ?? 999) - (right.distanceKm ?? 999)
    })
    .slice(0, 3)

  return { items, pagination: {} }
}

export async function getCaretakers(filters: CaretakerFilters = {}): Promise<PaginatedResult<Caretaker>> {
  const items = caretakers.filter((caretaker) => {
    if (caretaker.status !== 'active') return false
    if (filters.ratingMin && caretaker.rating < filters.ratingMin) return false
    if (filters.experienceRange && !isInExperienceRange(caretaker.experienceYears, filters.experienceRange)) return false
    if (filters.specialty && !caretaker.specialties.includes(filters.specialty)) return false
    return true
  })

  return { items, pagination: {} }
}

export async function getCaretakerById(caretakerId: string): Promise<Caretaker> {
  const caretaker = caretakers.find((item) => item.id === caretakerId)
  if (!caretaker) throw new Error('管护员不存在')
  return caretaker
}

export async function createAdoption(input: CreateAdoptionInput): Promise<CreateAdoptionResult> {
  const field = await getFieldById(input.fieldId)
  const caretaker = await getCaretakerById(input.caretakerId)

  if (field.status !== 'idle') throw new Error('该田地已不可认养')
  if (caretaker.status !== 'active') throw new Error('该管护员暂不可选')

  const adoptionId = `adoption-${field.id}-${caretaker.id}`
  const paymentOrderId = `payment-${field.id}-${caretaker.id}`

  adoptionStore.set(adoptionId, {
    id: adoptionId,
    userId: 'user-demo',
    fieldId: field.id,
    caretakerId: caretaker.id,
    status: 'pending_payment',
    paymentOrderId,
    createdAt: '2026-05-23T10:00:00+08:00'
  })

  return {
    adoptionId,
    status: 'pending_payment',
    paymentOrderId,
    nextUrl: `/pages/payment/confirm?adoption_id=${adoptionId}`
  }
}

export function getStoredAdoption(adoptionId: string): Adoption | undefined {
  return adoptionStore.get(adoptionId)
}
