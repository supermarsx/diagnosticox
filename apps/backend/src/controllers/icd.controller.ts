import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthRequest } from '../middleware/auth.middleware';

type ICDEntry = {
  id: string;
  code?: string;
  title: string;
  chapter?: string;
  theCode?: string;
};

const cache: Record<string, ICDEntry[]> = {};

function loadIndex(version: 'icd10' | 'icd11'): ICDEntry[] {
  if (cache[version]) return cache[version];
  const file = path.join(process.cwd(), 'research', 'icd', `${version}.ndjson`);
  if (!fs.existsSync(file)) {
    cache[version] = [];
    return cache[version];
  }
  const entries = fs
    .readFileSync(file, 'utf-8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as ICDEntry;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ICDEntry[];
  cache[version] = entries;
  return entries;
}

export class ICDController {
  search(req: AuthRequest, res: Response) {
    const version = (req.query.version as string) === 'icd10' ? 'icd10' : 'icd11';
    const q = (req.query.q as string) || '';
    if (!q) return res.status(400).json({ error: 'q is required' });

    const idx = loadIndex(version);
    const term = q.toLowerCase();
    const results = idx
      .filter((entry) => {
        const code = (entry.code || entry.id || '').toLowerCase();
        const title = (entry.title || '').toLowerCase();
        const chapter = (entry.chapter || '').toLowerCase();
        return code.includes(term) || title.includes(term) || chapter.includes(term);
      })
      .slice(0, 50);

    res.json({ version, count: results.length, results });
  }

  detail(req: AuthRequest, res: Response) {
    const version = (req.params.version as string) === 'icd10' ? 'icd10' : 'icd11';
    const code = req.params.code;
    if (!code) return res.status(400).json({ error: 'code required' });

    const idx = loadIndex(version);
    const match = idx.find((e) => e.id === code || e.code === code || e.theCode === code);
    if (!match) return res.status(404).json({ error: 'Not found' });

    res.json({ version, entry: match });
  }
}

export const icdController = new ICDController();
