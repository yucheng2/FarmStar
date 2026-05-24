import Database from 'better-sqlite3'
import { caretakers, careLogs, fields, monitoringMedia } from '../../src/mocks/gardenData'

function syncImageAssets(db: Database.Database): void {
  const updateCaretaker = db.prepare('UPDATE caretakers SET avatar_url = ?, real_photo_url = ? WHERE id = ?')
  for (const caretaker of caretakers) {
    updateCaretaker.run(caretaker.avatarUrl, caretaker.realPhotoUrl, caretaker.id)
  }

  const updateField = db.prepare('UPDATE fields SET image_url = ?, crop_icon_url = ? WHERE id = ?')
  for (const field of fields) {
    updateField.run(field.imageUrl ?? null, field.crop?.iconUrl ?? null, field.id)
  }
}

function syncCaretakers(db: Database.Database): void {
  const insertCaretaker = db.prepare(`
    INSERT OR REPLACE INTO caretakers (
      id, name, age, village, experience_years, specialties, rating,
      review_count, completed_adoptions_last_30_days, positive_rate,
      avatar_url, real_photo_url, distance_km, status, phone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const c of caretakers) {
    insertCaretaker.run(
      c.id, c.name, c.age, c.village, c.experienceYears,
      JSON.stringify(c.specialties), c.rating, c.reviewCount,
      c.completedAdoptionsLast30Days, c.positiveRate,
      c.avatarUrl, c.realPhotoUrl, c.distanceKm ?? null, c.status, c.phone ?? null
    )
  }
}

function syncFields(db: Database.Database): void {
  const insertField = db.prepare(`
    INSERT OR REPLACE INTO fields (
      id, code, name, area_square_meters, status, image_url, adoption_id,
      crop_id, crop_name, crop_icon_url, crop_progress_percent,
      expected_harvest_date, caretaker_id, location_latitude, location_longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const f of fields) {
    insertField.run(
      f.id, f.code, f.name, f.areaSquareMeters, f.status,
      f.imageUrl ?? null,
      f.adoptionId ?? null,
      f.crop?.id ?? null, f.crop?.name ?? null, f.crop?.iconUrl ?? null,
      f.crop?.progressPercent ?? null,
      f.expectedHarvestDate ?? null,
      f.caretaker?.id ?? null,
      f.location?.latitude ?? null, f.location?.longitude ?? null
    )
  }
}

function syncSeedAdoptions(db: Database.Database): void {
  const insertAdoption = db.prepare(`
    INSERT OR REPLACE INTO adoptions (id, user_id, field_id, caretaker_id, status, payment_order_id, created_at)
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

function syncMonitoringData(db: Database.Database): void {
  const insertMedia = db.prepare(`
    INSERT OR REPLACE INTO field_monitoring_media (id, field_id, type, url, captured_at, caption)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  for (const media of monitoringMedia) {
    const fieldId = media.id.replace(/^media-/, '').replace(/-\d+$/, '')
    insertMedia.run(media.id, fieldId, media.type, media.url, media.capturedAt, media.caption)
  }

  const insertCareLog = db.prepare(`
    INSERT OR REPLACE INTO field_care_logs (id, field_id, action, note, created_at, caretaker_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  for (const [fieldId, logs] of Object.entries(careLogs)) {
    for (const log of logs) {
      insertCareLog.run(log.id, fieldId, log.action, log.note, log.createdAt, log.caretakerName)
    }
  }
}

export function seedDatabase(db: Database.Database): void {
  const fieldColumns = db.prepare('PRAGMA table_info(fields)').all() as { name: string }[]
  if (!fieldColumns.some((column) => column.name === 'image_url')) {
    db.prepare('ALTER TABLE fields ADD COLUMN image_url TEXT').run()
  }

  const caretakerColumns = db.prepare('PRAGMA table_info(caretakers)').all() as { name: string }[]
  if (!caretakerColumns.some((column) => column.name === 'phone')) {
    db.prepare('ALTER TABLE caretakers ADD COLUMN phone TEXT').run()
  }

  db.prepare(`
    CREATE TABLE IF NOT EXISTS field_monitoring_media (
      id TEXT PRIMARY KEY,
      field_id TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      caption TEXT NOT NULL,
      FOREIGN KEY (field_id) REFERENCES fields(id)
    )
  `).run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS field_care_logs (
      id TEXT PRIMARY KEY,
      field_id TEXT NOT NULL,
      action TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL,
      caretaker_name TEXT NOT NULL,
      FOREIGN KEY (field_id) REFERENCES fields(id)
    )
  `).run()

  db.prepare('CREATE INDEX IF NOT EXISTS idx_monitoring_media_field ON field_monitoring_media(field_id)').run()
  db.prepare('CREATE INDEX IF NOT EXISTS idx_care_logs_field ON field_care_logs(field_id)').run()

  const caretakerCount = db.prepare('SELECT COUNT(*) as count FROM caretakers').get() as { count: number }
  if (caretakerCount.count > 0) {
    syncImageAssets(db)
    syncCaretakers(db)
    syncFields(db)
    syncSeedAdoptions(db)
    syncMonitoringData(db)
    return
  }

  syncCaretakers(db)
  syncFields(db)
  syncSeedAdoptions(db)
  syncMonitoringData(db)
}
