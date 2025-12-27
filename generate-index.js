const fs = require("fs");
const path = require("path");

// === CONFIG ===
const CARDS_DIR = "./cards/json";
const OUTPUT = "./data/index.json";

// =================

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—-]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const index = {};
const files = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith(".json"));

for (const file of files) {
  const filePath = path.join(CARDS_DIR, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  const id = data.id || file.replace(".json", "");
  const name = data.name;
  const color = (data.color || "").toLowerCase();

  if (!name || !color) {
    console.warn(`⚠️ Carta ignorata (name/color mancante): ${file}`);
    continue;
  }

  const key = normalizeName(name);

  if (!index[key]) index[key] = [];
  index[key].push({ id, color });
}

// Ordina alfabeticamente (comodo)
const sortedIndex = Object.fromEntries(
  Object.entries(index).sort((a, b) => a[0].localeCompare(b[0]))
);

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(sortedIndex, null, 2), "utf8");

console.log(`✅ index.json generato (${Object.keys(sortedIndex).length} nomi)`);
