// fix-json-encoding.js - CommonJS version (Windows friendly)

const fs = require("fs");
const path = require("path");

const folder = "./cards/json";

function tryFixString(s) {
  if (typeof s !== "string") return s;

  const manualFix = {
    "Ã ": "à",
    "Ã¨": "è",
    "Ã©": "é",
    "Ã¬": "ì",
    "Ã²": "ò",
    "Ã¹": "ù",
    "Ã€": "À",
    "Ãˆ": "È",
    "Ã‰": "É",
    "ÃŒ": "Ì",
    "Ã’": "Ò",
    "Ã™": "Ù",
    "Â ": ""
  };

  // sostituzioni manuali
  for (const k in manualFix) {
    s = s.replaceAll(k, manualFix[k]);
  }

  // fallback: latin1 -> utf8
  const candidate = Buffer.from(s, "latin1").toString("utf8");
  if (candidate !== s) {
    return candidate;
  }

  return s;
}

function walk(obj) {
  if (typeof obj === "string") return tryFixString(obj);

  if (Array.isArray(obj)) {
    return obj.map(walk);
  }

  if (obj && typeof obj === "object") {
    for (const k in obj) {
      obj[k] = walk(obj[k]);
    }
    return obj;
  }

  return obj;
}

let fixed = 0;
let total = 0;

for (const file of fs.readdirSync(folder)) {
  if (!file.endsWith(".json")) continue;

  total++;
  const p = path.join(folder, file);
  const raw = fs.readFileSync(p, "utf8");
  const obj = JSON.parse(raw);

  const before = JSON.stringify(obj);
  const afterObj = walk(obj);
  const after = JSON.stringify(afterObj);

  if (before !== after) {
    fs.writeFileSync(p, JSON.stringify(afterObj, null, 2) + "\n", "utf8");
    console.log("Fixed:", file);
    fixed++;
  }
}

console.log(`Done. ${fixed} fixed / ${total} files.`);
