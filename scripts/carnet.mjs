/**
 * Scelle ou descelle le contenu de l'espace privé.
 *
 *   npm run carnet:seal   carnet/ (en clair, ignoré par git)
 *                         → content/carnet.sealed.json (chiffré, versionné)
 *   npm run carnet:open   l'inverse : recrée carnet/ depuis le fichier scellé,
 *                         pour écrire sur une autre machine
 *
 * La clé est tirée de CARNET_SECRET (lu dans .env.local) exactement comme le
 * fait src/lib/carnet/access.ts. Sans le même secret en production, les
 * pages ne peuvent pas relire le contenu.
 */
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "carnet");
const SEALED = path.join(ROOT, "content", "carnet.sealed.json");

const secret = process.env.CARNET_SECRET;
if (!secret) {
  console.error("CARNET_SECRET manquant : renseignez-le dans .env.local (voir .env.example).");
  process.exit(1);
}
const key = Buffer.from(hkdfSync("sha256", secret, "", "carnet:contenu", 32));

function walk(dir, prefix = "") {
  const out = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix + entry.name;
    if (entry.isDirectory()) Object.assign(out, walk(path.join(dir, entry.name), `${rel}/`));
    else if (entry.name.endsWith(".md")) out[rel] = fs.readFileSync(path.join(dir, entry.name), "utf8");
  }
  return out;
}

function seal() {
  if (!fs.existsSync(SOURCE)) {
    console.error("Dossier carnet/ introuvable : rien à sceller.");
    process.exit(1);
  }
  const files = walk(SOURCE);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify({ files }), "utf8"), cipher.final()]);
  const out = { v: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: data.toString("base64") };
  fs.mkdirSync(path.dirname(SEALED), { recursive: true });
  fs.writeFileSync(SEALED, `${JSON.stringify(out)}\n`);
  console.log(`${Object.keys(files).length} fichiers scellés dans content/carnet.sealed.json.`);
}

function open() {
  const { iv, tag, data } = JSON.parse(fs.readFileSync(SEALED, "utf8"));
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  let json;
  try {
    json = Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
  } catch {
    console.error("Déchiffrement impossible : CARNET_SECRET ne correspond pas à celui du scellement.");
    process.exit(1);
  }
  const { files } = JSON.parse(json);
  const force = process.argv.includes("--force");
  let written = 0;
  for (const [rel, content] of Object.entries(files)) {
    const target = path.join(SOURCE, rel);
    if (fs.existsSync(target) && !force) {
      console.warn(`ignoré (existe déjà, --force pour écraser) : carnet/${rel}`);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
    written++;
  }
  console.log(`${written} fichiers écrits dans carnet/.`);
}

const command = process.argv[2];
if (command === "seal") seal();
else if (command === "open") open();
else {
  console.error("Usage : node scripts/carnet.mjs seal | open [--force]");
  process.exit(1);
}
