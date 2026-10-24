/** Text-free photographic covers for the 2026-10-24 AI agent security drafts. */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const sources = path.join(root, 'docs/design/ai-covers-2026-10-24/sources');
const output = path.join(root, 'public/blog-covers/ai-security-2026-10-24');

export const covers = [
  { key: 'agent-threat-model', source: 'server-aisle.jpg', position: 'centre' },
  { key: 'prompt-injection-code', source: 'lit-match.jpg', position: 'centre' },
  { key: 'production-keys', source: 'key-keyhole.jpg', position: 'centre' },
  { key: 'kill-switch-egress', source: 'fiber-optic.jpg', position: 'centre' },
  { key: 'litellm-supply-chain', source: 'chain.jpg', position: 'centre' },
  { key: 'php2shell', source: 'cracked-glass.jpg', position: 'centre' },
  { key: 'india-attacks', source: 'rail-tracks.jpg', position: 'centre' },
];

await mkdir(output, { recursive: true });
for (const c of covers) {
  let img = sharp(path.join(sources, c.source));
  if (c.extract) {
    const m = await img.metadata();
    img = sharp(await img.extract({ left: Math.round(m.width * c.extract.left), top: Math.round(m.height * c.extract.top),
      width: Math.round(m.width * c.extract.width), height: Math.round(m.height * c.extract.height) }).toBuffer());
  }
  await img.resize(1600, 840, { fit: 'cover', position: c.position }).webp({ quality: 82 })
    .toFile(path.join(output, `${c.key}.webp`));
  console.log(c.key);
}
