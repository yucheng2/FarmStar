import Database from 'better-sqlite3'
import { caretakers, fields } from '../../src/mocks/gardenData'

export function seedDatabase(db: Database.Database): void {
  const caretakerCount = db.prepare('SELECT COUNT(*) as count FROM caretakers').get() as { count: number }
  if (caretakerCount.count > 0) return

  const insertCaretaker = db.prepare(`
    INSERT INTO caretakers (
      id, name, age, village, experience_years, specialties, rating,
      review_count, completed_adoptions_last_30_days, positive_rate,
      avatar_url, real_photo_url, distance_km, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const c of caretakers) {
    insertCaretaker.run(
      c.id, c.name, c.age, c.village, c.experienceYears,
      JSON.stringify(c.specialties), c.rating, c.reviewCount,
      c.completedAdoptionsLast30Days, c.positiveRate,
      c.avatarUrl, c.realPhotoUrl, c.distanceKm ?? null, c.status
    )
  }

  const insertField = db.prepare(`
    INSERT INTO fields (
      id, code, name, area_square_meters, status, adoption_id,
      crop_id, crop_name, crop_icon_url, crop_progress_percent,
      expected_harvest_date, caretaker_id, location_latitude, location_longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const f of fields) {
    insertField.run(
      f.id, f.code, f.name, f.areaSquareMeters, f.status,
      f.adoptionId ?? null,
      f.crop?.id ?? null, f.crop?.name ?? null, f.crop?.iconUrl ?? null,
      f.crop?.progressPercent ?? null,
      f.expectedHarvestDate ?? null,
      f.caretaker?.id ?? null,
      f.location?.latitude ?? null, f.location?.longitude ?? null
    )
  }

  // Insert seed adoptions for adopted fields
  const insertAdoption = db.prepare(`
    INSERT INTO adoptions (id, user_id, field_id, caretaker_id, status, payment_order_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  for (const f of fields) {
    if (f.adoptionId && f.caretaker) {
      insertAdoption.run(
        f.adoptionId,
        'user-demo',
        f.id,
        f.caretaker.id,
        'pending_payment',
        `payment-${f.id}-${f.caretaker.id}`,
        '2026-05-23T10:00:00+08:00'
      )
    }
  }
}
