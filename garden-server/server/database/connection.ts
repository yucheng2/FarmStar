import Database from 'better-sqlite3'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

let db: Database.Database | null = null

export function getDatabase(dbPath = './data/farmstar.db'): Database.Database {
  if (db) return db

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  const schemaPath = join(dirname(import.meta.url.replace('file://', '')), 'schema.sql')
  const schema = readFileSync(schemaPath, 'utf-8')
  db.exec(schema)

  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
