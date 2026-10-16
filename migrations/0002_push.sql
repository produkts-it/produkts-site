-- Notifiche push del pannello /admin. Le crea anche functions/_push.js al primo uso (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS impostazioni (chiave TEXT PRIMARY KEY, valore TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS push (endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL, creato TEXT NOT NULL DEFAULT (datetime('now')));
