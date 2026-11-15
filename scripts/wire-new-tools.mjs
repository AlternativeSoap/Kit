/**
 * Patches BuiltinToolId, registry kitTools entries, i18n tools maps,
 * and BuiltinToolView for media + simple tools.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Load defs via dynamic import of compiled... use regex parse of ids from defs.ts instead
const defsSrc = readFileSync(
  join(ROOT, "src/tools/builtin/simple/defs.ts"),
  "utf8",
);
const simpleIds = [...defsSrc.matchAll(/id:\s*"([a-z0-9]+)"/g)].map((m) => m[1]);
const mediaIds = [
  "crop",
  "resize",
  "imgcompress",
  "imgconvert",
  "imagerotate",
  "vidcompress",
];

const mediaMeta = {
  crop: {
    name: "Image crop",
    nameDa: "Beskær billede",
    description: "Crop an image in your browser and download PNG or JPEG. Nothing is uploaded.",
    descriptionDa: "Beskær et billede i browseren og hent PNG eller JPEG. Intet uploades.",
    aliases: ["crop", "image crop", "beskær", "crop image"],
    intents: ["crop", "image"],
    tags: ["image"],
    popularity: 92,
  },
  resize: {
    name: "Image resize",
    nameDa: "Skaler billede",
    description: "Resize an image by pixels or keep aspect ratio. Local only.",
    descriptionDa: "Skaler et billede i pixels eller behold format. Kun lokalt.",
    aliases: ["resize", "image resize", "skaler billede", "scale image"],
    intents: ["resize", "image"],
    tags: ["image"],
    popularity: 93,
  },
  imgcompress: {
    name: "Image compress",
    nameDa: "Komprimer billede",
    description: "Compress a JPEG or WebP image toward a target size in your browser.",
    descriptionDa: "Komprimer et JPEG- eller WebP-billede mod en målstørrelse i browseren.",
    aliases: ["compress image", "image compress", "komprimer billede", "squash image"],
    intents: ["compress", "image"],
    tags: ["image"],
    popularity: 95,
  },
  imgconvert: {
    name: "Image convert",
    nameDa: "Konvertér billede",
    description: "Convert between PNG, JPEG, and WebP locally in your browser.",
    descriptionDa: "Konvertér mellem PNG, JPEG og WebP lokalt i browseren.",
    aliases: ["convert image", "png to jpg", "webp", "konvertér billede"],
    intents: ["convert", "image"],
    tags: ["image"],
    popularity: 91,
  },
  imagerotate: {
    name: "Image rotate / flip",
    nameDa: "Roter / spejlvend billede",
    description: "Rotate or flip an image and download the result. Local only.",
    descriptionDa: "Roter eller spejlvend et billede og hent resultatet. Kun lokalt.",
    aliases: ["rotate image", "flip image", "roter billede", "spejlvend"],
    intents: ["rotate", "image"],
    tags: ["image"],
    popularity: 88,
  },
  vidcompress: {
    name: "Video compress",
    nameDa: "Komprimer video",
    description:
      "Compress or trim a video in your browser with ffmpeg.wasm. Files stay on your device.",
    descriptionDa:
      "Komprimer eller klip en video i browseren med ffmpeg.wasm. Filer bliver på din enhed.",
    aliases: ["compress video", "video compress", "komprimer video", "trim video"],
    intents: ["compress", "video"],
    tags: ["video"],
    popularity: 94,
  },
};

// Parse simple tool metadata from defs by evaluating with tsx-like approach: read nameEn blocks
function parseSimpleMeta() {
  const blocks = defsSrc.split(/{\s*\n\s*id:\s*"/).slice(1);
  const out = [];
  for (const block of blocks) {
    const id = block.match(/^([a-z0-9]+)"/)?.[1];
    if (!id) continue;
    const nameEn = block.match(/nameEn:\s*"([^"]+)"/)?.[1] ?? id;
    const nameDa = block.match(/nameDa:\s*"([^"]+)"/)?.[1] ?? id;
    const descriptionEn = block.match(/descriptionEn:\s*"([^"]+)"/)?.[1] ?? "";
    const descriptionDa = block.match(/descriptionDa:\s*"([^"]+)"/)?.[1] ?? "";
    const aliases = [
      ...(block.match(/aliases:\s*\[([^\]]*)\]/)?.[1].match(/"([^"]+)"/g) ?? []).map(
        (s) => s.slice(1, -1),
      ),
    ];
    const intents = [
      ...(block.match(/intents:\s*\[([^\]]*)\]/)?.[1].match(/"([^"]+)"/g) ?? []).map(
        (s) => s.slice(1, -1),
      ),
    ];
    const tags = [
      ...(block.match(/tags:\s*\[([^\]]*)\]/)?.[1].match(/"([^"]+)"/g) ?? []).map((s) =>
        s.slice(1, -1),
      ),
    ];
    const popularity = Number(block.match(/popularity:\s*(\d+)/)?.[1] ?? 70);
    out.push({
      id,
      nameEn,
      nameDa,
      descriptionEn,
      descriptionDa,
      aliases,
      intents,
      tags,
      popularity,
    });
  }
  return out;
}

const simpleMeta = parseSimpleMeta();
console.log("media", mediaIds.length, "simple", simpleMeta.length);

// —— types.ts ——
const typesPath = join(ROOT, "src/tools/types.ts");
let types = readFileSync(typesPath, "utf8");
const allNew = [...mediaIds, ...simpleMeta.map((s) => s.id)];
const unionAdd = allNew.map((id) => `  | "${id}"`).join("\n");
if (!types.includes('"crop"')) {
  types = types.replace(
    /\| "contrast";/,
    `| "contrast"\n${unionAdd};`,
  );
  writeFileSync(typesPath, types);
  console.log("patched types.ts");
}

// —— registry ——
const regPath = join(ROOT, "src/tools/registry.ts");
let reg = readFileSync(regPath, "utf8");

function kitEntry(id, name, description, aliases, intents, tags, popularity, builtinId = id) {
  const aliasLit = aliases.map((a) => JSON.stringify(a)).join(", ");
  const intentLit = intents.map((a) => JSON.stringify(a)).join(", ");
  const tagLit = tags.map((a) => JSON.stringify(a)).join(", ");
  return `  {
    id: ${JSON.stringify(id)},
    slug: ${JSON.stringify(id)},
    name: ${JSON.stringify(name)},
    description: ${JSON.stringify(description)},
    aliases: [${aliasLit}],
    intents: [${intentLit}],
    popularity: ${popularity},
    kind: "builtin",
    surface: "kit",
    builtinId: ${JSON.stringify(builtinId)},
    ...LOCAL_BUILTIN,
    tags: [${tagLit}],
    capabilities: ["calculate"],
  },`;
}

if (!reg.includes('id: "crop"')) {
  const entries = [];
  for (const id of mediaIds) {
    const m = mediaMeta[id];
    entries.push(
      kitEntry(
        id,
        m.name,
        m.description,
        m.aliases,
        m.intents,
        m.tags,
        m.popularity,
      ),
    );
  }
  for (const s of simpleMeta) {
    entries.push(
      kitEntry(
        s.id,
        s.nameEn,
        s.descriptionEn,
        s.aliases.length ? s.aliases : [s.id],
        s.intents.length ? s.intents : [s.id],
        s.tags.length ? s.tags : ["tools"],
        s.popularity,
      ),
    );
  }
  // Insert before skat-udbetaling external or before closing of kitTools
  reg = reg.replace(
    /\n  {\n    id: "skat-udbetaling"/,
    `\n${entries.join("\n")}\n  {\n    id: "skat-udbetaling"`,
  );
  writeFileSync(regPath, reg);
  console.log("patched registry.ts");
}

// —— i18n en/da tools maps ——
function patchToolsMap(path, lang) {
  let src = readFileSync(path, "utf8");
  if (src.includes("crop: {")) return;
  const lines = [];
  for (const id of mediaIds) {
    const m = mediaMeta[id];
    lines.push(`    ${JSON.stringify(id)}: {
      name: ${JSON.stringify(lang === "da" ? m.nameDa : m.name)},
      description: ${JSON.stringify(lang === "da" ? m.descriptionDa : m.description)},
    },`);
  }
  for (const s of simpleMeta) {
    lines.push(`    ${JSON.stringify(s.id)}: {
      name: ${JSON.stringify(lang === "da" ? s.nameDa : s.nameEn)},
      description: ${JSON.stringify(lang === "da" ? s.descriptionDa : s.descriptionEn)},
    },`);
  }
  // insert after contrast tools entry
  src = src.replace(
    /(contrast: \{\s*name: [^}]+\},\s*)/,
    `$1${lines.join("\n")}\n`,
  );
  writeFileSync(path, src);
  console.log("patched", path);
}

patchToolsMap(join(ROOT, "src/i18n/dictionaries/en.ts"), "en");
patchToolsMap(join(ROOT, "src/i18n/dictionaries/da.ts"), "da");

// —— i18n imageTool / videoTool / types ——
const typesI18n = join(ROOT, "src/i18n/types.ts");
let ti = readFileSync(typesI18n, "utf8");
if (!ti.includes("imageTool:")) {
  ti = ti.replace(
    /export type Dictionary = \{/,
    `export type Dictionary = {
  imageTool: {
    localNote: string;
    pickImage: string;
    loadError: string;
    processError: string;
    invalid: string;
    download: string;
    working: string;
    previewEmpty: string;
    x: string;
    y: string;
    width: string;
    height: string;
    keepAspect: string;
    maxKb: string;
    quality: string;
    flipH: string;
    flipV: string;
    png: string;
    jpeg: string;
    webp: string;
    heicNote: string;
  };
  videoTool: {
    localNote: string;
    limitNote: string;
    pickVideo: string;
    tooLarge: string;
    processError: string;
    crf: string;
    crfHint: string;
    trimStart: string;
    trimEnd: string;
    optional: string;
    download: string;
    working: string;
  };`,
  );
  writeFileSync(typesI18n, ti);
  console.log("patched i18n types");
}

function ensureMediaDict(path, lang) {
  let src = readFileSync(path, "utf8");
  if (src.includes("imageTool:")) return;
  const block =
    lang === "da"
      ? `
  imageTool: {
    localNote: "Filen behandles kun i din browser. Intet uploades til Kit.",
    pickImage: "Vælg billede",
    loadError: "Billedet kunne ikke indlæses. Prøv PNG, JPEG eller WebP.",
    processError: "Behandlingen mislykkedes. Prøv et andet format eller en mindre fil.",
    invalid: "Tjek at målene er gyldige tal.",
    download: "Hent resultat",
    working: "Arbejder…",
    previewEmpty: "Forhåndsvisning vises her.",
    x: "X",
    y: "Y",
    width: "Bredde",
    height: "Højde",
    keepAspect: "Behold billedformat",
    maxKb: "Maks. størrelse (KB)",
    quality: "Kvalitet",
    flipH: "Spejlvend vandret",
    flipV: "Spejlvend lodret",
    png: "PNG",
    jpeg: "JPEG",
    webp: "WebP",
    heicNote: "HEIC understøttes kun hvis din browser kan åbne det.",
  },
  videoTool: {
    localNote: "Videoen komprimeres lokalt med ffmpeg.wasm. Intet uploades til Kit.",
    limitNote: "Maks. filstørrelse: {max}. Større filer kan få browseren til at gå i stå.",
    pickVideo: "Vælg video",
    tooLarge: "Filen er for stor. Maks. er {max}.",
    processError: "Komprimering mislykkedes. Prøv en kortere klip eller et andet format.",
    crf: "Kvalitet (CRF)",
    crfHint: "Lavere tal = bedre kvalitet og større fil. Typisk 23–32.",
    trimStart: "Start (sekunder)",
    trimEnd: "Slut (sekunder)",
    optional: "valgfri",
    download: "Komprimer og hent",
    working: "Komprimerer…",
  },`
      : `
  imageTool: {
    localNote: "The file is processed only in your browser. Nothing is uploaded to Kit.",
    pickImage: "Choose image",
    loadError: "Could not load the image. Try PNG, JPEG, or WebP.",
    processError: "Processing failed. Try another format or a smaller file.",
    invalid: "Check that the dimensions are valid numbers.",
    download: "Download result",
    working: "Working…",
    previewEmpty: "Preview appears here.",
    x: "X",
    y: "Y",
    width: "Width",
    height: "Height",
    keepAspect: "Keep aspect ratio",
    maxKb: "Max size (KB)",
    quality: "Quality",
    flipH: "Flip horizontal",
    flipV: "Flip vertical",
    png: "PNG",
    jpeg: "JPEG",
    webp: "WebP",
    heicNote: "HEIC works only if your browser can decode it.",
  },
  videoTool: {
    localNote: "Video is compressed locally with ffmpeg.wasm. Nothing is uploaded to Kit.",
    limitNote: "Max file size: {max}. Larger files can freeze the browser.",
    pickVideo: "Choose video",
    tooLarge: "File is too large. Max is {max}.",
    processError: "Compression failed. Try a shorter clip or another format.",
    crf: "Quality (CRF)",
    crfHint: "Lower number = better quality and larger file. Typical range 23–32.",
    trimStart: "Start (seconds)",
    trimEnd: "End (seconds)",
    optional: "optional",
    download: "Compress and download",
    working: "Compressing…",
  },`;
  src = src.replace(/\n  tools: \{/, `${block}\n  tools: {`);
  writeFileSync(path, src);
  console.log("media dict", path);
}

ensureMediaDict(join(ROOT, "src/i18n/dictionaries/en.ts"), "en");
ensureMediaDict(join(ROOT, "src/i18n/dictionaries/da.ts"), "da");

// —— BuiltinToolView ——
const viewPath = join(ROOT, "src/tools/builtin/index.tsx");
let view = readFileSync(viewPath, "utf8");
if (!view.includes("ImageTool")) {
  view = view.replace(
    `import { ContrastTool } from "./contrast/ContrastTool";`,
    `import { ContrastTool } from "./contrast/ContrastTool";
import { ImageTool } from "./media/ImageTool";
import { VideoCompressTool } from "./media/VideoCompressTool";
import { SimpleTool } from "./simple/SimpleTool";
import { SIMPLE_TOOL_IDS } from "./simple/defs";`,
  );
  const mediaCases = `
    case "crop":
      return <ImageTool mode="crop" />;
    case "resize":
      return <ImageTool mode="resize" />;
    case "imgcompress":
      return <ImageTool mode="compress" />;
    case "imgconvert":
      return <ImageTool mode="convert" />;
    case "imagerotate":
      return <ImageTool mode="rotate" />;
    case "vidcompress":
      return <VideoCompressTool />;`;
  view = view.replace(
    `case "contrast":
      return <ContrastTool prefill={prefill} />;
    default:
      return null;`,
    `case "contrast":
      return <ContrastTool prefill={prefill} />;${mediaCases}
    default:
      if ((SIMPLE_TOOL_IDS as readonly string[]).includes(id)) {
        return <SimpleTool id={id} />;
      }
      return null;`,
  );
  writeFileSync(viewPath, view);
  console.log("patched BuiltinToolView");
}

console.log("done", allNew.length, "new tools");
