import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { caretakers as seedCaretakers, fields as seedFields } from '../../src/mocks/gardenData'
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
} from '../../src/types/garden'

type GardenRepositoryOptions = {
  adoptionStoragePath?: string
}

function readAdoptions(adoptionStoragePath: string) {
  if (!existsSync(adoptionStoragePath)) return []
  return JSON.parse(readFileSync(adoptionStoragePath, 'utf-8')) as Adoption[]
}

function writeAdoptions(adoptionStoragePath: string, adoptions: Adoption[]) {
  mkdirSync(dirname(adoptionStoragePath), { recursive: true })
  const temporaryPath = `${adoptionStoragePath}.tmp`
  writeFileSync(temporaryPath, JSON.stringify(adoptions, null, 2))
  renameSync(temporaryPath, adoptionStoragePath)
}

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

function createSeedAdoptions(fields: Field[]): Adoption[] {
  return fields
    .filter((field) => field.status === 'adopted' && field.adoptionId && field.caretaker)
    .map((field) => ({
      id: field.adoptionId as string,
      userId: 'user-demo',
      fieldId: field.id,
      caretakerId: field.caretaker?.id as string,
      status: 'pending_payment',
      paymentOrderId: `payment-${field.id}-${field.caretaker?.id}`,
      createdAt: '2026-05-23T10:00:00+08:00'
    }))
}

export function createGardenRepository(options: GardenRepositoryOptions = {}) {
  const fields = seedFields.map((field) => ({ ...field }))
  const caretakers = seedCaretakers.map((caretaker) => ({ ...caretaker }))
  const persistedAdoptions = options.adoptionStoragePath ? readAdoptions(options.adoptionStoragePath) : []
  const adoptionStore = new Map<string, Adoption>(
    [...createSeedAdoptions(fields), ...persistedAdoptions].map((adoption) => [adoption.id, adoption])
  )

  persistedAdoptions.forEach((adoption) => {
    const field = fields.find((item) => item.id === adoption.fieldId)
    if (field) {
      field.status = 'adopted'
      field.adoptionId = adoption.id
    }
  })

  function persistAdoptions() {
    if (options.adoptionStoragePath) writeAdoptions(options.adoptionStoragePath, [...adoptionStore.values()])
  }

  function getFields(filters: FieldFilters = {}): PaginatedResult<Field> {
    const items = fields.filter((field) => {
      if (filters.status && field.status !== filters.status) return false
      if (filters.cropType && !field.crop?.name) return false
      if (filters.caretakerRatingMin && (field.caretaker?.rating ?? 0) < filters.caretakerRatingMin) return false
      if (filters.keyword && !includesKeyword(field, filters.keyword)) return false
      return true
    })

    return { items, pagination: {} }
  }

  function getFieldById(fieldId: string): Field {
    const field = fields.find((item) => item.id === fieldId)
    if (!field) throw new Error('田地不存在')
    return field
  }

  function getRecommendedCaretakers(fieldId: string): PaginatedResult<Caretaker> {
    getFieldById(fieldId)

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

  function getCaretakers(filters: CaretakerFilters = {}): PaginatedResult<Caretaker> {
    const items = caretakers.filter((caretaker) => {
      if (caretaker.status !== 'active') return false
      if (filters.ratingMin && caretaker.rating < filters.ratingMin) return false
      if (filters.experienceRange && !isInExperienceRange(caretaker.experienceYears, filters.experienceRange)) return false
      if (filters.specialty && !caretaker.specialties.includes(filters.specialty)) return false
      return true
    })

    return { items, pagination: {} }
  }

  function getCaretakerById(caretakerId: string): Caretaker {
    const caretaker = caretakers.find((item) => item.id === caretakerId)
    if (!caretaker) throw new Error('管护员不存在')
    return caretaker
  }

  function createAdoption(input: CreateAdoptionInput): CreateAdoptionResult {
    const field = getFieldById(input.fieldId)
    const caretaker = getCaretakerById(input.caretakerId)

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
    field.status = 'adopted'
    field.adoptionId = adoptionId
    field.caretaker = {
      id: caretaker.id,
      name: caretaker.name,
      rating: caretaker.rating,
      avatarUrl: caretaker.avatarUrl,
      distanceKm: caretaker.distanceKm,
      experienceYears: caretaker.experienceYears,
      status: caretaker.status
    }
    persistAdoptions()

    return {
      adoptionId,
      status: 'pending_payment',
      paymentOrderId,
      nextUrl: `/pages/payment/confirm?adoption_id=${adoptionId}`
    }
  }

  function getAdoptionById(adoptionId: string): Adoption {
    const adoption = adoptionStore.get(adoptionId)
    if (!adoption) throw new Error('认养记录不存在')
    return adoption
  }

  return {
    getFields,
    getFieldById,
    getRecommendedCaretakers,
    getCaretakers,
    getCaretakerById,
    createAdoption,
    getAdoptionById
  }
}

export type GardenRepository = ReturnType<typeof createGardenRepository>
