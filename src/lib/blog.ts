/**
 * Blog utilities — reads MDX posts from src/content/blog/.
 * All functions are server-side only (use Node fs APIs).
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;           // ISO date string e.g. "2026-04-08"
  description: string;
  category: string;
  calculators: string[];  // e.g. ["bah", "total-compensation"]
  readTime: number;       // minutes
  author: string;
}

export interface Post extends PostMeta {
  content: string; // raw MDX content (without frontmatter)
}

export function getAllPostMeta(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { data } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? '2026-01-01',
      description: data.description ?? '',
      category: data.category ?? 'General',
      calculators: data.calculators ?? [],
      readTime: data.readTime ?? 5,
      author: data.author ?? 'Dan Stevens',
    } as PostMeta;
  });

  // Sort newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '2026-01-01',
    description: data.description ?? '',
    category: data.category ?? 'General',
    calculators: data.calculators ?? [],
    readTime: data.readTime ?? 5,
    author: data.author ?? 'Dan Stevens',
    content,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
