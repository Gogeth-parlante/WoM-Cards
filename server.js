const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const DB = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "cards.json"), "utf8"));
const INDEX = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "index.json"), "utf8"));

app.get("/cards/:id", (req, res) => {
    const card = DB[req.params.id];
    if (!card) return res.status(404).json({ error: "Card not found" });
    res.json(card);
});

app.get("/search", (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    const norm = q
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, "")
        .trim();

    const ids = INDEX[norm] || [];
    const results = ids.map(id => DB[id]);

    res.json(results);
});

app.listen(4242, () => {
    console.log("🚀 WoM local API in ascolto su http://localhost:4242");
});
