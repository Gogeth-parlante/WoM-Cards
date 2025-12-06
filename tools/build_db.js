// tools/build_db.js
// Generatore database WoM stile Scryfall (statico per GitHub Pages)

const fs = require("fs");
const path = require("path");

// File di input (tuo JSON minificato fixato)
const INPUT_FILE = path.join(__dirname, "..", "cards", "wom_cards_vB.fixed.min.json");

// Output database
const OUT_DB_FULL  = path.join(__dirname, "..", "data", "cards.json");
const OUT_DB_INDEX = path.join(__dirname, "..", "data", "index.json");


// ------------------------------------------------------------
// NORMALIZZATORE NOMI (stesso algoritmo dell'importer Lua)
// ------------------------------------------------------------
function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // rimuove accenti
        .replace(/[^a-z0-9]+/g, " ")                      // simboli strani → spazio
        .replace(/\s+/g, " ")                             // spazi multipli → singolo
        .trim();
}


// ------------------------------------------------------------
// MAIN
// ------------------------------------------------------------
function main() {
    console.log("📦 Generazione database WoM…");

    if (!fs.existsSync(INPUT_FILE)) {
        console.error("❌ File sorgente non trovato:", INPUT_FILE);
        process.exit(1);
    }

    const raw = fs.readFileSync(INPUT_FILE, "utf8");
    const json = JSON.parse(raw);

    // Supporta JSON con formato: { cards: [...] }
    const cards = json.cards || json;

    console.log(`→ Trovate ${cards.length} carte`);

    const db = {};     // cards.json
    const index = {};  // index.json (ricerca veloce)

    for (const card of cards) {
        const id = card.id;
        const norm = normalize(card.name);

        db[id] = {
            ...card,
            name_normalized: norm
        };

        if (!index[norm]) index[norm] = [];
        index[norm].push(id);
    }

    // Scrivi file
    fs.writeFileSync(OUT_DB_FULL, JSON.stringify(db, null, 2), "utf8");
    fs.writeFileSync(OUT_DB_INDEX, JSON.stringify(index, null, 2), "utf8");

    console.log("✅ Database generato!");
    console.log("📄 data/cards.json");
    console.log("🔍 data/index.json");
}

main();
