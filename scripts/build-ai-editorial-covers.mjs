/** Original editorial photo/type treatments, not model/product screenshots. */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const review = path.join(root, 'docs/design/ai-covers-2026-10-02');
const output = path.join(root, 'public/blog-covers/ai-editorial-2026-10-02');
const fontfile = path.join(root, 'public/fonts/ClashDisplay-Variable.ttf');
const W = 1600;
const H = 840;
const ink = '#101828';
const paper = '#f5f1e8';
const green = '#00ff99';

export const covers = [
  { key: 'foundry-boundaries', slug: 'foundry-agent-service-production-checklist', title: 'Agents need boundaries.', label: 'Foundry Agent Service', source: 'nasa-discover-room.jpg', layout: 'boundary', alt: 'Editorial collage of a photographed supercomputer behind a green boundary, with the words Agents need boundaries.' },
  { key: 'openwebui-stream', slug: 'openwebui-fastapi-model-discovery-streaming', title: 'Make the stream work.', label: 'Open WebUI + FastAPI', source: 'taylor-vick-network.jpg', layout: 'stream', alt: 'Monochrome network-cable photograph with green stream bands and the words Make the stream work.' },
  { key: 'prefix-reuse', slug: 'prefix-caching-vs-kv-cache', title: 'Same prefix. Less prefill.', label: 'Prefix caching / KV cache', source: 'nasa-discover-detail.jpg', layout: 'reuse', alt: 'Three repeated crops of supercomputer hardware beside the words Same prefix. Less prefill., an editorial metaphor for prefix reuse.' },
  { key: 'kv-memory', slug: 'kv-cache-memory-sizing-gqa-optimization', title: 'Context has a memory bill.', label: 'KV cache memory sizing', source: 'nasa-discover-detail.jpg', layout: 'memory', alt: 'Close-cropped monochrome supercomputer cabinets beside a large KV monogram and the words Context has a memory bill.' },
];

const tile = async (width, height, color) => sharp({ create: { width, height, channels: 4, background: color } }).png().toBuffer();
const photo = async (source, width, height) => sharp(path.join(review, 'sources', source))
  .resize(width, height, { fit: 'cover', position: 'centre' }).greyscale().normalise().png().toBuffer();

async function type(text, size, color, left, top) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const input = await sharp({ text: {
    text: `<span foreground="${color}">${escaped}</span>`,
    font: `Clash Display Variable Bold ${size}`, fontfile, rgba: true, dpi: 72,
  } }).png().toBuffer();
  const { width, height } = await sharp(input).metadata();
  if (left < 0 || top < 0 || left + width > W || top + height > H) throw new Error(`Type exceeds canvas: ${text}`);
  return { input, left, top };
}

async function render(c) {
  const layers = [];
  if (c.layout === 'boundary') {
    layers.push({ input: await photo(c.source, 770, H), left: 830, top: 0 });
    layers.push({ input: await tile(25, H, green), left: 830, top: 0 });
    layers.push({ input: await tile(610, 2, ink), left: 158, top: 560 });
  } else if (c.layout === 'stream') {
    layers.push({ input: await photo(c.source, W, H), left: 0, top: 0 });
    layers.push({ input: await tile(W, H, { r: 16, g: 24, b: 40, alpha: 0.45 }), left: 0, top: 0 });
    for (const top of [222, 274, 326]) layers.push({ input: await tile(420, 12, green), left: 1020, top });
    layers.push({ input: await tile(620, 14, green), left: 158, top: 560 });
  } else if (c.layout === 'reuse') {
    const strip = await photo(c.source, 280, 450);
    for (const [left, top] of [[720, 140], [925, 205], [1130, 270]]) {
      layers.push({ input: await tile(288, 458, green), left: left - 4, top: top - 4 });
      layers.push({ input: strip, left, top });
    }
    layers.push({ input: await tile(700, 2, ink), left: 130, top: 618 });
  } else {
    layers.push({ input: await photo(c.source, 675, H), left: 925, top: 0 });
    layers.push({ input: await tile(90, 90, green), left: 930, top: 125 });
    layers.push({ input: await tile(610, 2, ink), left: 158, top: 618 });
  }
  const image = await sharp({ create: { width: W, height: H, channels: 4, background: paper } })
    .composite(layers).webp({ quality: 87, effort: 6 }).toBuffer();
  if (image.length > 300_000) throw new Error(`Cover exceeds 300 KB: ${c.key}`);
  await writeFile(path.join(output, `${c.key}.webp`), image);
  return { ...c, path: `/blog-covers/ai-editorial-2026-10-02/${c.key}.webp`, width: W, height: H,
    bytes: image.length, sha256: createHash('sha256').update(image).digest('hex') };
}

export async function build() {
  // Process-local Fontconfig only; do not modify macOS/system font settings.
  process.env.FONTCONFIG_FILE ||= path.join(review, 'fonts.conf');
  await mkdir(path.join(root, '.local/ai-cover-font-cache'), { recursive: true });
  await mkdir(output, { recursive: true });
  const manifest = [];
  for (const c of covers) manifest.push(await render(c));
  await writeFile(path.join(review, 'covers.json'), JSON.stringify(manifest, null, 2) + '\n');
  const board = [];
  for (const [i, c] of manifest.entries()) {
    const input = await sharp(path.join(root, 'public', c.path)).resize(760, 399).toBuffer();
    board.push({ input, left: 24 + (i % 2) * 784, top: 24 + Math.floor(i / 2) * 423 });
  }
  await sharp({ create: { width: 1592, height: 870, channels: 4, background: paper } })
    .composite(board).webp({ quality: 88 }).toFile(path.join(review, 'contact-sheet.webp'));
  const samples = [];
  for (const c of manifest) {
    const src = (await readFile(path.join(root, 'public', c.path))).toString('base64');
    samples.push(`<section><h2>${c.label}</h2><p>${c.title}</p><img class="full" src="data:image/webp;base64,${src}" alt="${c.alt}"><div class="crops"><figure><img class="crop" src="data:image/webp;base64,${src}" alt="${c.alt}"><figcaption>16:10 lead crop</figcaption></figure><figure><img class="thumb" src="data:image/webp;base64,${src}" alt="${c.alt}"><figcaption>260×164 hover crop</figcaption></figure></div></section>`);
  }
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>AI editorial cover review</title><style>body{margin:0;background:${paper};color:${ink};font:16px system-ui}main{max-width:1100px;margin:auto;padding:36px 24px}h1{font-size:34px;letter-spacing:-.04em}section{border-top:1px solid #10182826;padding:28px 0 48px}h2{font-size:24px}.full{display:block;width:100%;height:auto}.crops{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;margin-top:20px}figure{margin:0}figcaption{margin-top:8px;color:#536074}.crop{width:100%;aspect-ratio:16/10;object-fit:cover}.thumb{width:260px;max-width:100%;aspect-ratio:260/164;object-fit:cover}@media(max-width:600px){.crops{grid-template-columns:1fr}h1{font-size:27px}}</style><main><h1>AI editorial covers</h1><p>Original photographic collage and type treatments. Draft review only; no existing cover replaced.</p>${samples.join('')}<p>Photographs: Taylor Vick / Unsplash and NASA / Pat Izzo. See ASSET_PROVENANCE.md for source links and usage conditions. Hardware photographs are visual metaphors, not pictures of Microsoft Foundry or tested deployments.</p></main></html>`;
  await writeFile(path.join(review, 'review.html'), html);
  console.log(JSON.stringify(manifest.map(({ key, bytes, width, height }) => ({ key, bytes, width, height }))));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
