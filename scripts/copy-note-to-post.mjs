import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const source = process.argv[2];
const titleArg = process.argv[3];

if (!source) {
  console.error('Usage: node scripts/copy-note-to-post.mjs <note.md> [slug-title]');
  process.exit(1);
}

const sourcePath = path.resolve(process.cwd(), source);
const postsDir = path.resolve(process.cwd(), '_posts');
const date = new Date().toISOString().slice(0, 10);
const sourceBase = path.basename(sourcePath, path.extname(sourcePath));
const safeTitle = (titleArg || sourceBase)
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[\\/]/g, '-');
const targetPath = path.join(postsDir, `${date}-${safeTitle}.md`);
const raw = await readFile(sourcePath, 'utf8');
const hasFrontmatter = raw.trimStart().startsWith('---');
const title = titleArg || sourceBase;
const content = hasFrontmatter
  ? raw
  : `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\nauthor: Gavin\ntags: []\n---\n\n${raw}`;

await mkdir(postsDir, { recursive: true });
await writeFile(targetPath, content);
console.log(`Copied to ${path.relative(process.cwd(), targetPath)}`);
