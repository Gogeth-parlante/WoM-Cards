// tools/build_db.js
// Generatore database WoM stile Scryfall

const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "..", "cards", "wom_cards_vB.fixed.min.json");

const OUT_DB_FULL   = path.join(__dirname, "..", "data", "cards.json");
const OUT_DB_INDEX  = path.join(__dirname, "..", "data", "index.json");

// Normalizza per ricerche (minuscole, rimuove accenti)
function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // rimuove accenti
        .replace(/[^a-z0-9]+/g, " ")  // ogni simbolo non alfanumerico → spazio
        .trim();
}


function main() {
    console.log("📦 Generazione database WoM…");

    if (!fs.existsSync(INPUT_FILE)) {
        console.error("❌ File sorgente non trovato:", INPUT_FILE);
        process.exit(1);
    }

    const raw = fs.readFileSync(INPUT_FILE, "utf8");
    const json = JSON.parse(raw);

    let cards = json.cards || json; // supporta entrambi i formati

    console.log(`→ Trovate ${cards.length} carte`);

    // Database finale
    const db = {};
    // Indice ricerche (name → lista ID)
    const index = {};

    for (const card of cards) {
        const id = card.id;

        // Normalizzazione nome
        const norm = normalizeName(card.name);

        // Inserimento nel DB finale
        db[id] = {
            ...card,
            name_normalized: norm
        };

        // Indice ricerca
        if (!index[norm]) index[norm] = [];
        index[norm].push(id);
    }

    // Scrittura file
    fs.writeFileSync(OUT_DB_FULL, JSON.stringify(db, null, 2), "utf8");
    fs.writeFileSync(OUT_DB_INDEX, JSON.stringify(index, null, 2), "utf8");

    console.log("✅ Database generato!");
    console.log("📄 data/cards.json");
    console.log("🔍 data/index.json");
}

main();
