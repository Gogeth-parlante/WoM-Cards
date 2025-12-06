// scripts/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

// === Percorsi DB ===
const DB_CARDS = path.join(__dirname, "..", "data", "cards.json");
const DB_INDEX = path.join(__dirname, "..", "data", "index.json");

if (!fs.existsSync(DB_CARDS) || !fs.existsSync(DB_INDEX)) {
    console.error("❌ Devi prima generare il DB con:  node tools/build_db.js");
    process.exit(1);
}

// Carica DB in memoria
const CARDS = JSON.parse(fs.readFileSync(DB_CARDS, "utf8"));
const INDEX = JSON.parse(fs.readFileSync(DB_INDEX, "utf8"));

// === ROUTES ===

// Lista tutte le carte
app.get("/cards", (req, res) => {
    res.json(CARDS);
});

// Ottieni carta per ID
app.get("/card/:id", (req, res) => {
    const id = req.params.id.toUpperCase();
    if (!CARDS[id]) return res.status(404).json({ error: "Card not found" });
    res.json(CARDS[id]);
});

// Ricerca per nome (normalizzato)
app.get("/search", (req, res) => {
    if (!req.query.q) return res.json([]);

    const q = req.query.q
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, "")
        .trim();

    const ids = INDEX[q] || [];

    res.json(ids.map(id => CARDS[id]));
});

// Avvia server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Mini-Scryfall WoM attivo su http://localhost:${PORT}`);
});
