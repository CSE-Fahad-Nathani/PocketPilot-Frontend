import fs from "fs";

const s = fs.readFileSync("public/favicon.svg", "utf8");
const match =
  s.match(/xlink:href="(data:image\/[^;]+;base64,[^"]+)"/) ||
  s.match(/href="(data:image\/[^;]+;base64,[^"]+)"/);

if (!match) {
  console.error("No embedded image found");
  process.exit(1);
}

const dataUrl = match[1];
const [meta, b64] = dataUrl.split(",");
const ext = meta.includes("png")
  ? "png"
  : meta.includes("jpeg") || meta.includes("jpg")
    ? "jpg"
    : "bin";

const out = `public/logos/_source-favicon.${ext}`;
fs.writeFileSync(out, Buffer.from(b64, "base64"));
console.log("wrote", out, fs.statSync(out).size);
