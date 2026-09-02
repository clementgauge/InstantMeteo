-- Schéma de base de données Cloudflare D1 pour Instant Météo (Compétition & Signalements Citoyens)

-- 1. Table des Joueurs & Classement
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  pseudo TEXT NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 1,
  multiplier INTEGER NOT NULL DEFAULT 1,
  locations_count INTEGER NOT NULL DEFAULT 0,
  badges_count INTEGER NOT NULL DEFAULT 0,
  badge_title TEXT NOT NULL DEFAULT 'Apprenti Météo',
  minutes_spent INTEGER NOT NULL DEFAULT 0,
  unlocked_badges_json TEXT DEFAULT '[]',
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_players_points ON players(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_players_pseudo ON players(pseudo);

-- 2. Table des Signalements Météo Citoyens en direct
CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  department TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  weather_code TEXT NOT NULL,
  weather_label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  temperature REAL,
  intensity TEXT DEFAULT 'MODÉRÉE',
  comment TEXT,
  reporter_pseudo TEXT NOT NULL,
  confirmations INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_created ON community_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_city ON community_reports(city);
