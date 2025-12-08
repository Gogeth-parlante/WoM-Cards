// fix-json-replace.js
const fs = require("fs");
const path = require("path");

const folder = "./cards/json";

let fixed = 0;
let total = 0;

for (const file of fs.readdirSync(folder)) {
  if (!file.endsWith(".json")) continue;

  total++;
  const p = path.join(folder, file);

  let text = fs.readFileSync(p, "utf8");

  // sostituzioni dirette
  const before = text;
  text = text.replaceAll("Ã ", "à");

  if (before !== text) {
    fs.writeFileSync(p, text, "utf8");
    console.log("Fixed:", file);
    fixed++;
  }
}

console.log(`Done. ${fixed} fixed / ${total} files.`);
