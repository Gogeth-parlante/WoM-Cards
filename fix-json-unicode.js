// fix-json-unicode.js
const fs = require("fs");
const path = require("path");

const folder = "./cards/json";

let fixed = 0;
let total = 0;

function normalizeWeirdChars(s) {
  if (typeof s !== "string") return s;

  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0);

    // caratteri ASCII normali
    if (code >= 32 && code <= 126) {
      out += ch;
      continue;
    }

    // lettere accentate già valide
    if ("àèéìòùÀÈÉÌÒÙ".includes(ch)) {
      out += ch;
      continue;
    }

    // se troviamo caratteri strani -> forziamo "à"
    out += "à";
  }

  return out;
}

for (const file of fs.readdirSync(folder)) {
  if (!file.endsWith(".json")) continue;
  total++;

  const p = path.join(folder, file);
  const text = fs.readFileSync(p, "utf8");

  // proviamo a lavorare direttamente sul testo
  const before = text;
  let after = "";

  for (const ch of before) {
    const code = ch.codePointAt(0);

    if (code >= 32 && code <= 126) {
      after += ch;
      continue;
    }

    if ("àèéìòùÀÈÉÌÒÙ".includes(ch)) {
      after += ch;
      continue;
    }

    after += "à";
  }

  if (before !== after) {
    fs.writeFileSync(p, after, "utf8");
    console.log("Fixed:", file);
    fixed++;
  }
}

console.log(`Done. ${fixed} fixed / ${total} files.`);
