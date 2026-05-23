import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { glob } from 'glob';
import { normalizeObsidianMarkdown } from './obsidian';

export type BlogPost = {
  slug: string;
  title: string;
  subtitle?: string;
  date: Date;
  author: string;
  tags: string[];
  excerpt: string;
  body: string;
  sourcePath: string;
};

const postsDir = path.resolve(process.cwd(), '_posts');

function normalizeDate(value: unknown, fileName: string) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) return parsed;
  }

  const fromName = fileName.match(/(\d{4})-(\d{2})-(\d{2})|(\d{2})(\d{2})(\d{2})/);
  if (fromName?.[1]) return new Date(`${fromName[1]}-${fromName[2]}-${fromName[3]}T00:00:00+08:00`);
  if (fromName?.[4]) return new Date(`20${fromName[4]}-${fromName[5]}-${fromName[6]}T00:00:00+08:00`);
  return new Date('2023-01-01T00:00:00+08:00');
}

function slugify(fileName: string) {
  const base = fileName.replace(/\.mdx?$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return base.replace(/\s+/g, '-').replace(/[\\/]/g, '-');
}

function normalizeTags(tags: unknown) {
  if (Array.isArray(tags)) return tags.map(String).map((tag) => tag.trim()).filter(Boolean);
  if (typeof tags === 'string') return tags.split(/[,，\s]+/).map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function stripMarkdown(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = await glob('*.{md,mdx}', { cwd: postsDir, absolute: true });
  const posts = await Promise.all(
    files.map(async (sourcePath) => {
      const raw = await readFile(sourcePath, 'utf8');
      const parsed = matter(raw);
      const fileName = path.basename(sourcePath);
      const title = String(parsed.data.title || fileName.replace(/\.mdx?$/i, ''));
      const fallbackSlug = createHash('sha1').update(fileName).digest('hex').slice(0, 8);

      return {
        slug: slugify(fileName) || fallbackSlug,
        title,
        subtitle: parsed.data.subtitle ? String(parsed.data.subtitle) : undefined,
        date: normalizeDate(parsed.data.date || parsed.data.Date, fileName),
        author: String(parsed.data.author || 'Gavin'),
        tags: normalizeTags(parsed.data.tags),
        excerpt: stripMarkdown(normalizeObsidianMarkdown(parsed.excerpt || parsed.content)).slice(0, 180),
        body: normalizeObsidianMarkdown(parsed.content),
        sourcePath,
      };
    }),
  );

  return posts.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
