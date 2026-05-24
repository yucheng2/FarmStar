-- FarmStar Database Schema

CREATE TABLE IF NOT EXISTS caretakers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  village TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  specialties TEXT NOT NULL, -- JSON array
  rating REAL NOT NULL,
  review_count INTEGER NOT NULL DEFAULT 0,
  completed_adoptions_last_30_days INTEGER NOT NULL DEFAULT 0,
  positive_rate INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT NOT NULL,
  real_photo_url TEXT NOT NULL,
  distance_km REAL,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS fields (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  area_square_meters INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  adoption_id TEXT,
  crop_id TEXT,
  crop_name TEXT,
  crop_icon_url TEXT,
  crop_progress_percent INTEGER,
  expected_harvest_date TEXT,
  caretaker_id TEXT,
  location_latitude REAL,
  location_longitude REAL,
  FOREIGN KEY (caretaker_id) REFERENCES caretakers(id)
);

CREATE TABLE IF NOT EXISTS adoptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  field_id TEXT NOT NULL,
  caretaker_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  payment_order_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (field_id) REFERENCES fields(id),
  FOREIGN KEY (caretaker_id) REFERENCES caretakers(id)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fields_status ON fields(status);
CREATE INDEX IF NOT EXISTS idx_fields_caretaker ON fields(caretaker_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_user ON adoptions(user_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_field ON adoptions(field_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
