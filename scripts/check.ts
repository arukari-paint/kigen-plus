/**
 * 公開前チェック：npm run build のあとに npm run check
 *
 * - 各ページの title / meta description / canonical / OGP / H1 / 画像の alt
 * - サイト内リンク切れ（href・src が dist.nosync/ のファイルを指しているか）
 * - sitemap.xml に食品ページがすべて載っているか、robots.txt があるか
 * - 禁止表現（「食べられます」「安全です」など）が使われていないか
 * - 消費期限の食品・参考値がない食品のページが作られていないか
 * - requireSources のとき：食品ページに URL つきの情報源があるか、sitemap に公開対象の食品だけが載っているか
 * - お問い合わせ導線（mailto:・メールアドレス・「お問い合わせ」）が残っていないか（Webサイトには問い合わせ先を載せない）
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteConfig } from '../site.config.ts';
import { allFoods, hasValidSources, publishedFoods } from '../src/foods.ts';
import { BASE_PATH, DIST_DIR, absUrl } from '../src/site.ts';

const DIST = fileURLToPath(new URL(`../${DIST_DIR}`, import.meta.url));
const errors: string[] = [];
const fail = (file: string, msg: string) => errors.push(`${file}: ${msg}`);

if (!existsSync(DIST)) {
  console.error(`${DIST_DIR}/ がありません。先に npm run build を実行してください。`);
  process.exit(1);
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** 安全性を断定・保証するように読める表現（指示書「食品安全に関する方針」） */
const FORBIDDEN = [
  '食べられます',
  '安全です',
  'まで大丈夫',
  '問題ありません',
  '食べられる期限',
  '安全な期限',
  '食べられる目安',
  'なら安心',
  '今回も大丈夫',
  '期限切れ食品を食べて',
  '食べればエコ',
];

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const titles = new Map<string, string>();

function resolveInternal(url: string): string | null {
  const clean = url.split(/[?#]/)[0];
  if (!clean.startsWith(`${BASE_PATH}/`)) return null;
  const rel = clean.slice(BASE_PATH.length);
  const p = join(DIST, rel);
  if (rel.endsWith('/')) return join(p, 'index.html');
  return p;
}

for (const file of htmlFiles) {
  const name = relative(DIST, file);
  const src = readFileSync(file, 'utf8');
  if (name === 'privacy.html') {
    if (!src.includes('http-equiv="refresh"')) fail(name, '転送ページになっていません');
    continue;
  }
  const noindex = src.includes('name="robots" content="noindex"');

  const title = src.match(/<title>([^<]+)<\/title>/)?.[1];
  if (!title) fail(name, 'title がありません');
  else if (!noindex) {
    if (titles.has(title)) fail(name, `title が ${titles.get(title)} と重複しています`);
    titles.set(title, name);
  }
  if (!/<meta name="description" content="[^"]{20,}">/.test(src)) fail(name, 'meta description がない／短すぎます');
  if (!src.includes('<html lang="ja">')) fail(name, 'lang="ja" がありません');
  if (!noindex) {
    const canonical = src.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
    if (!canonical) fail(name, 'canonical がありません');
    else if (!canonical.startsWith(absUrl('/'))) fail(name, `canonical が siteUrl と違います: ${canonical}`);
    for (const p of ['og:title', 'og:description', 'og:url', 'og:image']) {
      if (!src.includes(`property="${p}"`)) fail(name, `${p} がありません`);
    }
  }
  const h1 = src.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1 !== 1) fail(name, `H1 が ${h1} 個あります（1個にする）`);
  for (const img of src.match(/<img [^>]+>/g) ?? []) {
    if (!/ alt="[^"]*"/.test(img)) fail(name, `alt がない画像: ${img}`);
  }
  for (const m of src.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = resolveInternal(m[1]);
    if (target && !existsSync(target)) fail(name, `リンク切れ: ${m[1]}`);
    if (m[1].startsWith('/') && !m[1].startsWith(`${BASE_PATH}/`)) fail(name, `サイトのパスが付いていないリンク: ${m[1]}`);
  }

  // 情報源のタイトル（外部サイトの記事名そのもの）は除いて、禁止表現を確認する
  const text = src
    .replace(/<ul class="source-list">[\s\S]*?<\/ul>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, '');
  for (const w of FORBIDDEN) if (text.includes(w)) fail(name, `禁止表現「${w}」が含まれています`);

  // Webサイトには問い合わせ先を載せない
  if (src.includes('mailto:')) fail(name, 'mailto: リンクが残っています');
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(text)) fail(name, 'メールアドレスが含まれています');
  if (/問い合わせ|contact/i.test(text)) fail(name, '「お問い合わせ」の導線が残っています');
}

// 食品ページ
for (const f of allFoods) {
  const file = join(DIST, 'foods', f.slug, 'index.html');
  const published = publishedFoods.includes(f);
  if (published && !existsSync(file)) fail(`foods/${f.slug}/`, '食品ページがありません');
  if (!published && existsSync(file)) fail(`foods/${f.slug}/`, '公開しない食品のページが作られています');
  if (published && f.typicalDeadlineType === 'use_by') fail(`foods/${f.slug}/`, '消費期限の食品のページがあります');
  if (published && existsSync(file)) {
    const src = readFileSync(file, 'utf8');
    if (f.display.status === 'VALUE' && !src.includes(`<p class="ref-value">${f.display.typical}`)) {
      fail(`foods/${f.slug}/`, '代表値がファーストビューの位置にありません');
    }
    if (siteConfig.publish.requireSources) {
      if (!hasValidSources(f) || !/<ul class="source-list">[\s\S]*?<a href="https?:/.test(src)) {
        fail(`foods/${f.slug}/`, '情報源（リンク）がない食品ページがあります（requireSources: true）');
      }
      if (src.includes('整理中')) fail(`foods/${f.slug}/`, '「情報源は整理中」の食品ページがあります（requireSources: true）');
    }
    // 広告は参考値・注意書きから離す（KIGEN+ の案内より下だけ）
    const adAt = src.indexOf('class="ad-area"');
    if (adAt !== -1 && adAt < src.indexOf('class="cta-card"')) fail(`foods/${f.slug}/`, '広告が KIGEN+ の案内より上にあります');
    if (f.display.status !== 'VALUE' && /class="ref-value">\+\d/.test(src)) {
      fail(`foods/${f.slug}/`, '代表値がない食品に +○日 が表示されています');
    }
  }
}

// sitemap / robots
const sitemapFile = join(DIST, 'sitemap.xml');
const sitemap = existsSync(sitemapFile) ? readFileSync(sitemapFile, 'utf8') : '';
if (!sitemap) fail('sitemap.xml', 'ありません');
for (const p of ['/', '/foods/', '/about/', '/privacy/', '/disclaimer/', ...publishedFoods.map((f) => `/foods/${f.slug}/`)]) {
  if (!sitemap.includes(`<loc>${absUrl(p)}</loc>`)) fail('sitemap.xml', `${p} が載っていません`);
}
if (sitemap.includes('404')) fail('sitemap.xml', '404 ページが載っています');
const sitemapFoods = [...sitemap.matchAll(/<loc>[^<]*\/foods\/([^/<]+)\/<\/loc>/g)].map((m) => m[1]);
const publishedSlugs = new Set(publishedFoods.map((f) => f.slug));
for (const slug of sitemapFoods) if (!publishedSlugs.has(slug)) fail('sitemap.xml', `公開対象でない食品が載っています: ${slug}`);
if (sitemapFoods.length !== publishedFoods.length) fail('sitemap.xml', `食品ページ数が合いません（sitemap ${sitemapFoods.length} / 公開 ${publishedFoods.length}）`);
const robots = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
if (!robots.includes(`Sitemap: ${absUrl('/sitemap.xml')}`)) fail('robots.txt', 'Sitemap の行がありません');
if (/Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt', 'サイト全体をブロックしています');

if (errors.length) {
  console.error(`✗ ${errors.length} 件の問題があります\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(
  `✓ チェックOK（HTML ${htmlFiles.length} ファイル / 食品ページ ${publishedFoods.length} / sitemap ${sitemap.match(/<url>/g)?.length ?? 0} URL・うち食品 ${sitemapFoods.length}）`
);
