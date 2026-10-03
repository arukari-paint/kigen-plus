/**
 * サイトを作る：npm run build → dist/ に静的な HTML 一式ができる。
 *
 * 食品ページは data/foods.json から自動で作る（HTML を手で書かない）。
 * sitemap.xml も同じ一覧から作るので、食品を追加すると自動で載る。
 */
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteConfig } from '../site.config.ts';
import { allFoods, foodData, noReferenceFoods, pendingFoods, publishedFoods } from './foods.ts';
import { renderFood } from './pages/food.ts';
import { renderFoods } from './pages/foods.ts';
import {
  renderAbout,
  renderDisclaimer,
  renderNotFound,
  renderPrivacy,
  renderRedirect,
  renderSupport,
} from './pages/static.ts';
import { renderTop } from './pages/top.ts';
import { absUrl, BASE_PATH, hasAppStoreUrl } from './site.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

function write(sitePath: string, content: string): void {
  // '/foods/' → dist/foods/index.html、'/404.html' → dist/404.html
  const file = sitePath.endsWith('/') ? join(DIST, sitePath, 'index.html') : join(DIST, sitePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'public'), DIST, { recursive: true });

/** sitemap.xml に載せるページ（食品ページは自動で追加） */
const pages: { path: string; html: string }[] = [
  { path: '/', html: renderTop() },
  { path: '/foods/', html: renderFoods() },
  ...publishedFoods.map((f) => ({ path: `/foods/${f.slug}/`, html: renderFood(f) })),
  { path: '/about/', html: renderAbout() },
  { path: '/support/', html: renderSupport() },
  { path: '/privacy/', html: renderPrivacy() },
  { path: '/disclaimer/', html: renderDisclaimer() },
];

for (const p of pages) write(p.path, p.html);
write('/404.html', renderNotFound());
// App Store・アプリに登録済みの以前のURL
write('/privacy.html', renderRedirect('/privacy/', 'プライバシーポリシー'));

const lastmod = foodData.lastReviewedAt;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${absUrl(p.path)}</loc>${p.path.startsWith('/foods/') ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
write('/sitemap.xml', sitemap);

// robots.txt はサイトのルートに置くもの。プロジェクトサイト（/kigen-plus）の場合は
// ドメインのルート（arukari-paint.github.io）の robots.txt が使われるが、独自ドメインに移したときのために出力しておく
write('/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${absUrl('/sitemap.xml')}\n`);

console.log(
  `dist/ に ${pages.length + 2} ページを作りました` +
    `\n  食品：全${allFoods.length} / 公開（ページあり）${publishedFoods.length} / 情報源なしで公開準備中 ${pendingFoods.length} / 参考値なし ${noReferenceFoods.length}` +
    `（requireSources: ${siteConfig.publish.requireSources}）` +
    `\n  サイトURL: ${siteConfig.siteUrl}（パス: ${BASE_PATH || '/'}）` +
    `\n  参考データ ver.${foodData.datasetVersion}（${foodData.lastReviewedAt}）` +
    (hasAppStoreUrl ? '' : '\n  ⚠ appStoreUrl が未設定です（site.config.ts）')
);
