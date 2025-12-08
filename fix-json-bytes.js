// fix-json-bytes.js
const fs = require("fs");
const path = require("path");

const folder = "./cards/json";

let fixed = 0;
let total = 0;

// questi byte rappresentano le sequenze rotte più comuni
const badSequences = [
  Buffer.from([0xC3, 0x83, 0xC2, 0xA0]), // Ã  (rottura tipica di à)
  Buffer.from([0xC3, 0x83]),            // Ã
];

const goodChar = Buffer.from("à", "utf8");

for (const file of fs.readdirSync(folder)) {
  if (!file.endsWith(".json")) continue;
  total++;

  const p = path.join(folder, file);

  let buf = fs.readFileSync(p); // leggiamo come bytes

  let changed = false;

  for (const bad of badSequences) {
    let idx;
    while ((idx = buf.indexOf(bad)) !== -1) {
      buf = Buffer.concat([
        buf.slice(0, idx),
        goodChar,
        buf.slice(idx + bad.length)
      ]);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(p, buf);
    console.log("Fixed:", file);
    fixed++;
  }
}

console.log(`Done. ${fixed} fixed / ${total} files.`);
