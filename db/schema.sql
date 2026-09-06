-- ============================================================
-- Dance Hub — esquema de base de datos (Cloudflare D1 / SQLite)
-- Ejecutar con:
--   wrangler d1 execute dance_hub_db --local --file=./db/schema.sql
--   wrangler d1 execute dance_hub_db --remote --file=./db/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_id              TEXT UNIQUE NOT NULL,
  username                TEXT NOT NULL,
  avatar_url              TEXT,
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP,
  reserved_id_quota_used  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS moderators (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id),
  added_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  package_hash  TEXT UNIQUE NOT NULL,
  owner_id      INTEGER NOT NULL REFERENCES users(id),
  pack_name     TEXT NOT NULL,
  description   TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS package_versions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id    INTEGER NOT NULL REFERENCES packages(id),
  version       TEXT NOT NULL,
  authors       TEXT NOT NULL,      -- JSON array serializado
  release_date  TEXT NOT NULL,
  bin_file_url  TEXT NOT NULL,
  uploaded_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_current    INTEGER DEFAULT 1   -- SQLite no tiene BOOLEAN nativo
);

CREATE TABLE IF NOT EXISTS package_screenshots (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  package_version_id  INTEGER NOT NULL REFERENCES package_versions(id),
  image_url           TEXT NOT NULL,
  display_order       INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS song_ids (
  song_id             INTEGER PRIMARY KEY,
  status              TEXT NOT NULL CHECK(status IN ('free','reserved','used')),
  package_version_id  INTEGER REFERENCES package_versions(id),
  reserved_by         INTEGER REFERENCES users(id),
  title_cache         TEXT,
  artist_cache        TEXT
);

CREATE TABLE IF NOT EXISTS id_conflicts (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id             INTEGER NOT NULL,
  package_version_id  INTEGER NOT NULL REFERENCES package_versions(id),
  detected_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id       INTEGER NOT NULL,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  reserved_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  song_id     INTEGER NOT NULL,
  difficulty  TEXT NOT NULL,
  score       INTEGER NOT NULL,
  achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS score_submissions (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id               INTEGER NOT NULL REFERENCES users(id),
  song_id               INTEGER NOT NULL,
  difficulty            TEXT NOT NULL,
  score                 INTEGER NOT NULL,
  composed_video_url    TEXT,       -- NULL una vez que se toma una decisión
  status                TEXT NOT NULL CHECK(status IN ('pending','approved','rejected')) DEFAULT 'pending',
  rejection_reason      TEXT,
  locked_by             INTEGER REFERENCES users(id),
  locked_at             DATETIME,
  reviewed_by           INTEGER REFERENCES users(id),
  reviewed_at           DATETIME,
  submitted_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS moderation_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id   INTEGER NOT NULL REFERENCES score_submissions(id),
  moderator_id    INTEGER NOT NULL REFERENCES users(id),
  action          TEXT NOT NULL CHECK(action IN ('approved','rejected')),
  reason          TEXT,
  acted_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_pp (
  user_id       INTEGER PRIMARY KEY REFERENCES users(id),
  total_pp      REAL NOT NULL DEFAULT 0,   -- "Flow" en el juego
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices útiles para las consultas más frecuentes
CREATE INDEX IF NOT EXISTS idx_package_versions_package_id ON package_versions(package_id);
CREATE INDEX IF NOT EXISTS idx_song_ids_status ON song_ids(status);
CREATE INDEX IF NOT EXISTS idx_score_submissions_status ON score_submissions(status);
CREATE INDEX IF NOT EXISTS idx_scores_song_difficulty ON scores(song_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
