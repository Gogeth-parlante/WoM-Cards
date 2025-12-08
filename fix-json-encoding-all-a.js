// fix-json-encoding-all-a.js
// CommonJS - replace corrupted sequences with "à" (with backup)

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const folder = "./cards/json";

// create a timestamped backup of the folder (only first run)
function backupFolder(src) {
  if (!fs.existsSync(src)) return null;
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = `./cards/json-backup-${ts}`;
  // copy recursively
  function copyRecursive(srcDir, dstDir) {
    if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const dstPath = path.join(dstDir, entry.name);
      if (entry.isDirectory()) {
        copyRecursive(srcPath, dstPath);
      } else {
        fs.copyFileSync(srcPath, dstPath);
      }
    }
  }
  copyRecursive(src, dest);
  return dest;
}

// patterns to replace (common mojibake pieces and replacement characters)
// we assume the correct character is "à" as requested
const replacements = [
  // explicit sequences seen previously
  { find: /Ã /g, rep: "à" },
  { find: /Ã¨/g, rep: "à" },
  { find: /Ã©/g, rep: "à" },
  { find: /Ã¬/g, rep: "à" },
  { find: /Ã²/g, rep: "à" },
  { find: /Ã¹/g, rep: "à" },
  { find: /Ã€/g, rep: "À" },
  { find: /Ãˆ/g, rep: "À" },
  { find: /Ã‰/g, rep: "À" },
  { find: /ÃŒ/g, rep: "À" },
  { find: /Ã’/g, rep: "À" },
  { find: /Ã™/g, rep: "À" },
  // unicode replacement sequences sometimes printed as "ï¿½" or the actual replacement character \uFFFD
  { find: /ï¿½/g, rep: "à" },       // common visible sequence
  { find: /\uFFFD/g, rep: "à" },    // actual replacement character
  // stray "Â " and similar
  { find: /Â /g, rep: "" },
  // any leftover sequences of Ã followed by any single byte-like char (safe greedy)
  { find: /Ã./g, rep: "à" },
];

// heuristics: latin1->utf8 fallback (attempt)
function latin1ToUtf8(s) {
  try {
    return Buffer.from(s, "latin1").toString("utf8");
  } catch (e) {
    return s;
  }
}

function tryFixString(s) {
  if (typeof s !== "string") return s;

  let out = s;

  // apply explicit replacements first
  for (const r of replacements) {
    out = out.replace(r.find, r.rep);
  }

  // if still contains obvious mojibake markers, try latin1->utf8 and then replace replacement char
  if (/Ã|Â|ï¿½|\uFFFD/.test(out)) {
    const candidate = latin1ToUtf8(out);
    if (candidate && candidate !== out) out = candidate;
  }

  // final pass: replace any remaining replacement character with "à"
  out = out.replace(/\uFFFD/g, "à");
  out = out.replace(/ï¿½/g, "à");

  // as last resort, replace any remaining isolated non-ascii byte-like sequences like "Ãx" with "à"
  out = out.replace(/Ã./g, "à");

  return out;
}

function walk(obj) {
  if (typeof obj === "string") return tryFixString(obj);
  if (Array.isArray(obj)) return obj.map(walk);
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) obj[k] = walk(obj[k]);
    return obj;
  }
  return obj;
}

// --- run ---
if (!fs.existsSync(folder)) {
  console.error("Folder not found:", folder);
  process.exit(1);
}

// make backup
const backup = backupFolder(folder);
if (backup) {
  console.log("Backup created at", backup);
}

let fixed = 0;
let total = 0;

for (const file of fs.readdirSync(folder)) {
  if (!file.toLowerCase().endsWith(".json")) continue;
  total++;
  const p = path.join(folder, file);
  // read raw as utf8 (existing files)
  const raw = fs.readFileSync(p, "utf8");
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to parse JSON, skipping:", file, err.message);
    continue;
  }

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
