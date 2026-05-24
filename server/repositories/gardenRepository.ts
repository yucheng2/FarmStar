import type Database from 'better-sqlite3'
import type {
  Adoption,
  AdoptionListItem,
  Caretaker,
  CaretakerFilters,
  CreateAdoptionInput,
  CreateAdoptionResult,
  ExperienceRange,
  Field,
  FieldFilters,
  PaginatedResult,
  Specialty
} from '../../src/types/garden'

export type GardenRepositoryOptions = {
  db: Database.Database
}

function includesKeyword(field: Field, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase()
  const caretakerName = field.caretaker?.name ?? ''
  const cropName = field.crop?.name ?? ''

  return [field.code, field.name, caretakerName, cropName]
    .some((value) => value.toLowerCase().includes(normalizedKeyword))
}

function isInExperienceRange(years: number, range: ExperienceRange): boolean {
  if (range === '5_plus') return years >= 5
  if (range === '3_to_5') return years >= 3 && years <= 5
  return years >= 1 && years <= 3
}

function rowToCaretaker(row: Record<string, unknown>): Caretaker {
  return {
    id: String(row.id),
    name: String(row.name),
    age: Number(row.age),
    village: String(row.village),
    experienceYears: Number(row.experience_years),
    specialties: JSON.parse(String(row.specialties)) as Specialty[],
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    completedAdoptionsLast30Days: Number(row.completed_adoptions_last_30_days),
    positiveRate: Number(row.positive_rate),
    avatarUrl: String(row.avatar_url),
    realPhotoUrl: String(row.real_photo_url),
    distanceKm: row.distance_km ? Number(row.distance_km) : undefined,
    status: String(row.status) as Caretaker['status']
  }
}

function rowToField(row: Record<string, unknown>, caretaker?: Caretaker): Field {
  const field: Field = {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    areaSquareMeters: Number(row.area_square_meters),
    status: String(row.status) as Field['status'],
    adoptionId: row.adoption_id ? String(row.adoption_id) : undefined,
    caretaker: caretaker ? {
      id: caretaker.id,
      name: caretaker.name,
      rating: caretaker.rating,
      avatarUrl: caretaker.avatarUrl,
      distanceKm: caretaker.distanceKm,
      experienceYears: caretaker.experienceYears,
      status: caretaker.status
    } : undefined
  }

  if (row.crop_id) {
    field.crop = {
      id: String(row.crop_id),
      name: String(row.crop_name),
      iconUrl: String(row.crop_icon_url),
      progressPercent: Number(row.crop_progress_percent)
    }
  }

  if (row.expected_harvest_date) {
    field.expectedHarvestDate = String(row.expected_harvest_date)
  }

  if (row.location_latitude && row.location_longitude) {
    field.location = {
      latitude: Number(row.location_latitude),
      longitude: Number(row.location_longitude)
    }
  }

  return field
}

export function createGardenRepository(options: GardenRepositoryOptions) {
  const { db } = options

  function getCaretakerById(caretakerId: string): Caretaker {
    const row = db.prepare('SELECT * FROM caretakers WHERE id = ?').get(caretakerId) as Record<string, unknown> | undefined
    if (!row) throw new Error('管护员不存在')
    return rowToCaretaker(row)
  }

  function getFields(filters: FieldFilters = {}): PaginatedResult<Field> {
    let sql = 'SELECT * FROM fields'
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (filters.status) {
      conditions.push('status = ?')
      params.push(filters.status)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]

    let items = rows.map((row) => {
      const caretaker = row.caretaker_id ? getCaretakerById(String(row.caretaker_id)) : undefined
      return rowToField(row, caretaker)
    })

    if (filters.keyword) {
      items = items.filter((field) => includesKeyword(field, filters.keyword!))
    }

    if (filters.caretakerRatingMin) {
      items = items.filter((field) => (field.caretaker?.rating ?? 0) >= filters.caretakerRatingMin!)
    }

    return { items, pagination: {} }
  }

  function getFieldById(fieldId: string): Field {
    const row = db.prepare('SELECT * FROM fields WHERE id = ?').get(fieldId) as Record<string, unknown> | undefined
    if (!row) throw new Error('田地不存在')
    const caretaker = row.caretaker_id ? getCaretakerById(String(row.caretaker_id)) : undefined
    return rowToField(row, caretaker)
  }

  function getRecommendedCaretakers(fieldId: string): PaginatedResult<Caretaker> {
    getFieldById(fieldId)

    const rows = db.prepare('SELECT * FROM caretakers WHERE status = ? ORDER BY distance_km ASC').all('active') as Record<string, unknown>[]
    return { items: rows.map(rowToCaretaker), pagination: {} }
  }

  function getCaretakers(filters: CaretakerFilters = {}): PaginatedResult<Caretaker> {
    let sql = 'SELECT * FROM caretakers WHERE status = ?'
    const params: (string | number)[] = ['active']

    if (filters.ratingMin) {
      sql += ' AND rating >= ?'
      params.push(filters.ratingMin)
    }

    if (filters.specialty) {
      sql += ' AND specialties LIKE ?'
      params.push(`%${filters.specialty}%`)
    }

    sql += ' ORDER BY rating DESC'

    let rows = db.prepare(sql).all(...params) as Record<string, unknown>[]

    if (filters.experienceRange) {
      rows = rows.filter((row) => isInExperienceRange(Number(row.experience_years), filters.experienceRange!))
    }

    return { items: rows.map(rowToCaretaker), pagination: {} }
  }

  function getAdoptions(filters: { userId?: string } = {}): PaginatedResult<AdoptionListItem> {
    const userId = filters.userId ?? 'user-demo'
    const rows = db.prepare('SELECT * FROM adoptions WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Record<string, unknown>[]

    const items = rows.map((row) => {
      const adoption: Adoption = {
        id: String(row.id),
        userId: String(row.user_id),
        fieldId: String(row.field_id),
        caretakerId: String(row.caretaker_id),
        status: String(row.status) as Adoption['status'],
        paymentOrderId: String(row.payment_order_id),
        createdAt: String(row.created_at)
      }

      return {
        ...adoption,
        field: getFieldById(adoption.fieldId),
        caretaker: getCaretakerById(adoption.caretakerId)
      }
    })

    return { items, pagination: {} }
  }

  function createAdoption(input: CreateAdoptionInput & { userId?: string }): CreateAdoptionResult {
    const field = getFieldById(input.fieldId)
    const caretaker = getCaretakerById(input.caretakerId)

    if (field.status !== 'idle') throw new Error('该田地已不可认养')
    if (caretaker.status !== 'active') throw new Error('该管护员暂不可选')

    const adoptionId = `adoption-${field.id}-${caretaker.id}`
    const paymentOrderId = `payment-${field.id}-${caretaker.id}`
    const createdAt = new Date().toISOString()
    const userId = input.userId ?? 'user-demo'

    db.prepare(`
      INSERT INTO adoptions (id, user_id, field_id, caretaker_id, status, payment_order_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(adoptionId, userId, field.id, caretaker.id, 'pending_payment', paymentOrderId, createdAt)

    db.prepare(`
      UPDATE fields SET status = ?, adoption_id = ?, caretaker_id = ? WHERE id = ?
    `).run('adopted', adoptionId, caretaker.id, field.id)

    return {
      adoptionId,
      status: 'pending_payment',
      paymentOrderId,
      nextUrl: `/pages/payment/confirm?adoption_id=${adoptionId}`
    }
  }

  function getAdoptionById(adoptionId: string): Adoption {
    const row = db.prepare('SELECT * FROM adoptions WHERE id = ?').get(adoptionId) as Record<string, unknown> | undefined
    if (!row) throw new Error('认养记录不存在')

    return {
      id: String(row.id),
      userId: String(row.user_id),
      fieldId: String(row.field_id),
      caretakerId: String(row.caretaker_id),
      status: String(row.status) as Adoption['status'],
      paymentOrderId: String(row.payment_order_id),
      createdAt: String(row.created_at)
    }
  }

  function confirmPayment(adoptionId: string): { adoptionId: string; status: 'active'; amount: number; paidAt: string } {
    const adoption = getAdoptionById(adoptionId)

    if (adoption.status !== 'pending_payment') {
      throw new Error('该认养已支付')
    }

    const field = getFieldById(adoption.fieldId)
    const amount = field.areaSquareMeters * 12
    const paidAt = new Date().toISOString()

    db.prepare(`
      UPDATE adoptions SET status = ?, paid_at = ? WHERE id = ?
    `).run('active', paidAt, adoptionId)

    return {
      adoptionId,
      status: 'active',
      amount,
      paidAt
    }
  }

  return {
    getFields,
    getFieldById,
    getRecommendedCaretakers,
    getCaretakers,
    getCaretakerById,
    getAdoptions,
    createAdoption,
    getAdoptionById,
    confirmPayment
  }
}

export type GardenRepository = ReturnType<typeof createGardenRepository>
