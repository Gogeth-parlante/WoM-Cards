const fs = require("fs");
const path = require("path");

const folder = "./cards/json";

let fixed = 0;
let total = 0;

// Decodifica forzata mojibake (doppio passaggio sicuro)
function fixMojibake(str) {
  if (typeof str !== "string") return str;

  let before = str;
  let after = str;

  // primo giro: latin1 -> utf8
  try {
    after = Buffer.from(after, "latin1").toString("utf8");
  } catch {}

  // secondo giro se servisse ancora
  if (after.includes("Ã")) {
    try {
      after = Buffer.from(after, "latin1").toString("utf8");
    } catch {}
  }

  // casi residui
  after = after
    .replace(/ÃƒÂ /g, "à")
    .replace(/Ã /g, "à")
    .replace(/ï¿½/g, "à");

  return after;
}

function walk(obj) {
  if (typeof obj === "string") return fixMojibake(obj);

  if (Array.isArray(obj)) return obj.map(walk);

  if (obj && typeof obj === "object") {
    for (const k in obj) {
      obj[k] = walk(obj[k]);
    }
  }

  return obj;
}

for (const file of fs.readdirSync(folder)) {
  if (!file.endsWith(".json")) continue;

  total++;
  const p = path.join(folder, file);
  const raw = fs.readFileSync(p, "utf8");
  const obj = JSON.parse(raw);

  const before = JSON.stringify(obj);
  const fixedObj = walk(obj);
  const after = JSON.stringify(fixedObj);

  if (before !== after) {
    fs.writeFileSync(p, JSON.stringify(fixedObj, null, 2), "utf8");
    console.log("Fixed:", file);
    fixed++;
  }
}

console.log(`Done. ${fixed} fixed / ${total} files.`);
