const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "..", "wom_cards_vB.json");
const OUTPUT_API = path.join(__dirname, "..", "api");
const OUTPUT_BY_ID = path.join(OUTPUT_API, "by-id");

// Normalizza testo per ricerche
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // rimuove accenti
    .trim();
}

// --- Crea cartelle se non esistono ---
fs.mkdirSync(OUTPUT_API, { recursive: true });
fs.mkdirSync(OUTPUT_BY_ID, { recursive: true });

// --- Carica file principale ---
const raw = fs.readFileSync(INPUT, "utf8");
const data = JSON.parse(raw);

// Datasets per API
const index = [];
const autocomplete = [];
const searchEntries = [];

for (const card of data.cards) {
  const id = card.id;
  const name = card.name || "";
  const normalized = normalize(name);

  // Path immagine: usa stessa repo
  const imageUrl = `https://raw.githubusercontent.com/<TUO_USERNAME>/<TUO_REPO>/main/cards/${id}.jpg`;

  // Singolo file per carta
  const single = {
    ...card,
    name_normalized: normalized,
    image: imageUrl
  };

  fs.writeFileSync(
    path.join(OUTPUT_BY_ID, `${id}.json`),
    JSON.stringify(single, null, 2),
    "utf8"
  );

  // index.json
  index.push({
    id,
    name,
    name_normalized: normalized
  });

  // autocomplete
  autocomplete.push(normalized);

  // search.json
  searchEntries.push({
    id,
    name,
    name_normalized: normalized,
    type: card.type || "",
    text: card.text || ""
  });
}

// Scrivi output statici stile Scryfall
fs.writeFileSync(
  path.join(OUTPUT_API, "index.json"),
  JSON.stringify({ cards: index }, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(OUTPUT_API, "autocomplete.json"),
  JSON.stringify({ entries: autocomplete }, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(OUTPUT_API, "search.json"),
  JSON.stringify({ entries: searchEntries }, null, 2),
  "utf8"
);

console.log("✔ Database WoM generato correttamente!");
console.log("  - api/by-id/*");
console.log("  - api/index.json");
console.log("  - api/autocomplete.json");
console.log("  - api/search.json");
