/**
 * アプリ（KIGEN+）の食品データ → Webサイト用の data/foods.json を書き出す。
 *
 *   cd website && npm run data
 *
 * - アプリの src/data（食品DB・ネット参考・情報源）と src/lib/reference.ts（表示の文言）をそのまま読み込む。
 *   参考値・文言をWeb側で別に手入力しないため。
 * - アプリのソースがある環境（このリポジトリ）でだけ実行する。GitHub Actions では実行しない
 *   （書き出した data/foods.json をコミットしておき、それからサイトを作る）。
 */
import { registerHooks } from 'node:module';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { FoodData, FoodSource, ReferenceStatus, WebFood } from '../src/types.ts';

const here = dirname(fileURLToPath(import.meta.url));
const APP_SRC = resolve(here, '../../src');
const OUT = resolve(here, '../data/foods.json');

if (!existsSync(APP_SRC)) {
  console.error(`アプリのソースが見つかりません: ${APP_SRC}`);
  process.exit(1);
}

// アプリのコードは「@/data/foodCatalog」のような別名で import しているので、ファイルに読み替える
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const base = resolve(APP_SRC, specifier.slice(2));
      const file = [`${base}.ts`, `${base}/index.ts`].find((p) => existsSync(p));
      if (!file) throw new Error(`アプリのファイルが見つかりません: ${specifier}`);
      return { url: pathToFileURL(file).href, format: 'module-typescript', shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});

const app = (path: string) => import(`@/${path}`);

const { FOOD_CATALOG } = await app('data/foodCatalog');
const { getFoodReference, REFERENCE_DATASET_VERSION, REFERENCE_LAST_REVIEWED_AT } = await app('data/foodReferences');
const ref = await app('lib/reference');
const { formatApproxDuration } = await app('lib/duration');

type AnyRecord = Record<string, any>;

function cleanSources(list: AnyRecord[] | undefined): FoodSource[] {
  return (list ?? []).map((s) => ({
    title: String(s.title),
    sourceType: s.sourceType,
    // http(s) で始まるものだけリンクにする（それ以外は空にしてリンクしない）
    url: typeof s.url === 'string' && /^https?:\/\//.test(s.url) ? s.url : '',
  }));
}

function statusOf(r: AnyRecord): ReferenceStatus {
  if (r.referenceMode === 'NO_EXPIRATION') return 'NO_EXPIRATION';
  if (r.referenceMode === 'QUALITY_BASED') return 'QUALITY_BASED';
  if (!ref.hasReferenceValue(r)) return 'NONE';
  return r.referenceMode === 'NO_FIXED_LIMIT' ? 'NO_FIXED_LIMIT' : 'VALUE';
}

const foods: WebFood[] = FOOD_CATALOG.map((f: AnyRecord): WebFood => {
  const r: AnyRecord = getFoodReference(f.id);
  if (!r) throw new Error(`ネット参考データがありません: ${f.id}`);
  let status = statusOf(r);
  // 消費期限の食品には「期限後+○日」を出さない（アプリと同じ）
  if (f.typicalDeadlineType === 'use_by' && (status === 'VALUE' || status === 'NO_FIXED_LIMIT')) status = 'NONE';

  // アプリの「なぜ数値を出さないか」の文言を、アプリと同じ判定で作る
  const state = ref.getReferenceStateForCatalogFood(f.id);
  const hiddenReason =
    status === 'VALUE' || status === 'NO_FIXED_LIMIT'
      ? null
      : (ref.hiddenReasonText(state) ?? r.referenceExcludedReason ?? 'この食品のネット参考値はありません。');

  const o: AnyRecord | undefined = r.openedReference;

  return {
    foodId: f.id,
    slug: f.id.replace(/_/g, '-'),
    displayName: f.name,
    aliases: f.aliases,
    keywords: f.keywords,
    category: f.category,
    typicalDeadlineType: f.typicalDeadlineType,
    defaultStorage: f.defaultStorage,
    catalogNote: f.note ?? null,
    referenceMode: r.referenceMode,
    referenceMinDays: r.referenceMinDays,
    referenceTypicalDays: r.referenceTypicalDays,
    referenceMaxDays: r.referenceMaxDays,
    confidence: r.confidence,
    assumedOpenedStatus: r.assumedOpenedStatus,
    assumedStorage: r.assumedStorage,
    note: r.note ?? null,
    sources: cleanSources(r.sources),
    display: {
      status,
      typical: status === 'VALUE' || status === 'NO_FIXED_LIMIT' ? ref.formatReferenceTypical(r) : null,
      typicalApprox:
        status === 'VALUE' && r.referenceTypicalDays !== null ? formatApproxDuration(r.referenceTypicalDays) : null,
      range: status === 'VALUE' ? ref.formatReferenceRange(r) : null,
      rangeApprox: status === 'VALUE' ? ref.formatReferenceRangeApprox(r) : null,
      condition: ref.referenceConditionText(r),
      hiddenReason,
    },
    opened: o
      ? {
          value: ref.formatOpenedReference(o),
          condition: ref.openedReferenceConditionText(o),
          note: o.note ?? null,
          sources: cleanSources(o.sources),
        }
      : null,
  };
});

const slugs = new Set<string>();
for (const f of foods) {
  if (slugs.has(f.slug)) throw new Error(`slug が重複しています: ${f.slug}`);
  slugs.add(f.slug);
}

const data: FoodData = {
  datasetVersion: REFERENCE_DATASET_VERSION,
  lastReviewedAt: REFERENCE_LAST_REVIEWED_AT,
  texts: { definition: ref.REFERENCE_DEFINITION, notSafety: ref.REFERENCE_NOT_SAFETY },
  foods,
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);

const count = (s: ReferenceStatus) => foods.filter((f) => f.display.status === s).length;
console.log(
  `data/foods.json を書き出しました（参考データ ver.${data.datasetVersion}）：全${foods.length}食品` +
    ` / 代表値あり ${count('VALUE')} / 目安なし ${count('NO_FIXED_LIMIT')}` +
    ` / 期限表示なし ${count('NO_EXPIRATION')} / 品質で判断 ${count('QUALITY_BASED')} / 参考値なし ${count('NONE')}`
);
