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

-- 3. Données initiales d'exemple (Seeding pour démarrer le classement mondial)
INSERT OR IGNORE INTO players (id, pseudo, total_points, streak_days, multiplier, locations_count, badges_count, badge_title)
VALUES 
  ('usr-bot-1', 'ChasseurDOrages_31', 3450, 42, 2, 18, 9, 'Grand Maître Cumulonimbus'),
  ('usr-bot-2', 'AltiMétéo_Chamonix', 2980, 35, 2, 14, 8, 'Sentinelle des Sommets'),
  ('usr-bot-3', 'MistralGagnant_13', 2650, 28, 1, 12, 7, 'Chasseur de Rafales'),
  ('usr-bot-4', 'VigilanceBreizh_29', 2310, 24, 1, 11, 7, 'Sentinelle Océanique'),
  ('usr-bot-5', 'GivreEtNeige_Vosges', 1980, 19, 1, 9, 6, 'Pisteur de Blizzard'),
  ('usr-bot-6', 'PluvioPassion_64', 1740, 16, 1, 8, 5, 'Observateur Hydrologique'),
  ('usr-bot-7', 'CaniculeSurfer_84', 1420, 12, 1, 7, 5, 'Guetteur d''Isobar'),
  ('usr-bot-8', 'Nephologue_Paris', 1150, 9, 1, 6, 4, 'Cartographe des Nuages');

INSERT OR IGNORE INTO community_reports (id, city, department, latitude, longitude, weather_code, weather_label, emoji, temperature, intensity, comment, reporter_pseudo, confirmations)
VALUES
  ('rep-seed-1', 'Lyon', 'Rhône (69)', 45.7640, 4.8357, 'storm', 'Orage violent & Foudre', '⚡', 18.5, 'FORTE', 'Activité électrique marquée sur Fourvière.', 'ChasseurDOrages_31', 12),
  ('rep-seed-2', 'Bordeaux', 'Gironde (33)', 44.8378, -0.5792, 'rain', 'Pluie battante / Averse', '🌧️', 14.2, 'MODÉRÉE', 'Averse soutenue sur le centre.', 'AquitaineMétéo', 8),
  ('rep-seed-3', 'Brest', 'Finistère (29)', 48.3904, -4.4861, 'wind', 'Violentes Rafales de vent', '💨', 12.0, 'FORTE', 'Rafales de 78 km/h relevées au port.', 'VigilanceBreizh_29', 15),
  ('rep-seed-4', 'Chamonix-Mont-Blanc', 'Haute-Savoie (74)', 45.9237, 6.8694, 'snow', 'Chute de Neige au sol', '❄️', -1.5, 'MODÉRÉE', 'Neige tenant au sol dès 1050m.', 'AltiMétéo_Chamonix', 21);
