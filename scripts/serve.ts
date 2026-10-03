/**
 * dist/ を手元のブラウザで確認するための小さなサーバー（公開には使わない）。
 *   npm run serve → http://localhost:4321/kigen-plus/
 * GitHub Pages と同じく、サイトのパス（/kigen-plus）の下に置いた状態で配信する。
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BASE_PATH } from '../src/site.ts';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const PORT = Number(process.env.PORT ?? 4321);
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.json': 'application/json',
};

createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  if (BASE_PATH && urlPath === '/') {
    res.writeHead(302, { Location: `${BASE_PATH}/` }).end();
    return;
  }
  let file: string | null = null;
  if (urlPath.startsWith(`${BASE_PATH}/`)) {
    const rel = normalize(urlPath.slice(BASE_PATH.length)).replace(/^(\.\.[/\\])+/, '');
    const candidate = join(DIST, rel);
    if (existsSync(candidate) && statSync(candidate).isDirectory()) {
      if (!urlPath.endsWith('/')) {
        res.writeHead(301, { Location: `${urlPath}/` }).end();
        return;
      }
      file = join(candidate, 'index.html');
    } else {
      file = candidate;
    }
  }
  if (file && existsSync(file) && statSync(file).isFile()) {
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
    return;
  }
  res.writeHead(404, { 'Content-Type': TYPES['.html'] });
  res.end(readFileSync(join(DIST, '404.html')));
}).listen(PORT, () => {
  console.log(`http://localhost:${PORT}${BASE_PATH}/`);
});
