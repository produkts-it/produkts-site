-- Database D1 dei moduli di produkts.it (giurisdizione UE)
CREATE TABLE contatti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creato TEXT NOT NULL DEFAULT (datetime('now')),
  tipo TEXT,
  budget TEXT,
  quando TEXT,
  dove TEXT,
  nome TEXT NOT NULL,
  recapito TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  letto INTEGER NOT NULL DEFAULT 0
);

-- Le recensioni restano in attesa finché Karim non le approva dalla pagina /admin
CREATE TABLE recensioni (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creato TEXT NOT NULL DEFAULT (datetime('now')),
  nome TEXT NOT NULL,
  servizio TEXT NOT NULL,
  voto INTEGER NOT NULL CHECK (voto BETWEEN 1 AND 5),
  testo TEXT NOT NULL,
  stato TEXT NOT NULL DEFAULT 'attesa' CHECK (stato IN ('attesa', 'approvata', 'rifiutata')),
  in_evidenza INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX recensioni_stato ON recensioni (stato, creato);
