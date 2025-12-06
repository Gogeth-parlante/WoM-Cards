// Node 18+ recommended
const fs = require('fs');
const path = require('path');

// === PERCORSI IMPORTANTI ===

// Input JSON è in: ../cards/wom_cards_vB.json
const INPUT_FILE = path.join(__dirname, '..', 'cards', 'wom_cards_vB.json');

// I mini JSON li mettiamo in: ../cards/json/
const OUT_DIR = path.join(__dirname, '..', 'cards', 'json');

// names.json va nella root del repo: ../names.json
const NAMES_FILE = path.join(__dirname, '..', 'names.json');

// Crea la cartella output se non esiste
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// === LETTURA FILE PRINCIPALE ===
let raw;
try {
  raw = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
} catch (e) {
  console.error('Errore: impossibile leggere o parsare', INPUT_FILE, e.message);
  process.exit(1);
}

if (!raw.cards || !Array.isArray(raw.cards)) {
  console.error('Formato JSON non valido: manca "cards".');
  process.exit(1);
}

// === GENERAZIONE MINI JSON + INDICE NOMI ===
const namesIndex = {};
let count = 0;

for (const c of raw.cards) {
  const id = c.id;
  if (!id) continue;

  const outObj = {
    id: c.id,
    name: c.name,
    name_normalized: c.name_normalized,
    type: c.type,
    color: c.color,
    expansion: c.expansion,
    number: c.number,
    image_url: c.url || c.image_url || null
  };

  const filename = path.join(OUT_DIR, id + '.json');
  fs.writeFileSync(filename, JSON.stringify(outObj, null, 2), 'utf8');

  if (typeof c.name_normalized === 'string' && c.name_normalized.trim() !== '') {
    if (!namesIndex[c.name_normalized]) {
      namesIndex[c.name_normalized] = id;
    }
  }

  count++;
}

fs.writeFileSync(NAMES_FILE, JSON.stringify(namesIndex, null, 2), 'utf8');

console.log('Done: generated', count, 'card files in /cards/json');
console.log('Names index entries:', Object.keys(namesIndex).length);
