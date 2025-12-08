const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "cards", "wom_cards_vB.fixed.min.json");
const OUT = path.join(__dirname, "..", "cards", "json_new");

const raw = fs.readFileSync(SRC, "utf8");
const data = JSON.parse(raw);

let cards = Array.isArray(data) ? data :
  data.cards ? data.cards :
  Object.values(data);

if (!fs.existsSync(OUT)) {
  fs.mkdirSync(OUT, { recursive: true });
}

// Regole "italiane" per forzare à
function italianFix(name) {
  if (!name) return name;

  return name
    .replace(/Verita\b/g, "Verità")
    .replace(/Realta\b/g, "Realtà")
    .replace(/Curiosita\b/g, "Curiosità")
    .replace(/Oscurita\b/g, "Oscurità");
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

let count = 0;

for (const c of cards) {
  if (!c.id) continue;

  const cleanName = italianFix(c.name);

  const obj = {
    id: c.id,
    name: cleanName,
    name_normalized: normalize(cleanName),
    type: c.type,
    color: c.color,
    expansion: c.expansion,
    number: c.number,
    image_url:
      "https://raw.githubusercontent.com/Gogeth-parlante/WoM-Cards/main/cards/" +
      c.id + ".jpg"
  };

  const file = path.join(OUT, `${c.id}.json`);
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), "utf8");
  count++;
}

console.log(`Rigenerati ${count} file JSON con correzione italiana`);
