/**
 * 食品データ（data/foods.json）の読み込みと、ページを作る食品の判定。
 */
import { readFileSync } from 'node:fs';

import { siteConfig } from '../site.config.ts';
import type { FoodData, WebFood } from './types.ts';

export const foodData: FoodData = JSON.parse(
  readFileSync(new URL('../data/foods.json', import.meta.url), 'utf8')
) as FoodData;

/** 参考値（または専用の説明）があり、消費期限の食品ではないか。アプリでネット参考カードを出す食品 */
export function hasWebReference(food: WebFood): boolean {
  return food.display.status !== 'NONE' && food.typicalDeadlineType !== 'use_by';
}

/** リンクできる情報源（URL つき）が1件以上あるか */
export function hasValidSources(food: WebFood): boolean {
  return food.sources.some((s) => s.title.trim() !== '' && /^https?:\/\//.test(s.url));
}

/**
 * 食品ページを作るか（= 検索エンジンに公開し、sitemap.xml に載せるか）。
 * - 参考値（または専用の説明）があり、消費期限の食品ではない
 * - site.config.ts の publish.requireSources が true なら、URL つきの情報源があること
 * 公開設定を食品ごとに手で切り替える必要はない（データに情報源が入れば自動で公開される）
 */
export function isPublished(food: WebFood): boolean {
  if (!hasWebReference(food)) return false;
  if (siteConfig.publish.requireSources && !hasValidSources(food)) return false;
  return true;
}

export const allFoods: readonly WebFood[] = foodData.foods;
export const publishedFoods: readonly WebFood[] = allFoods.filter(isPublished);
/** 参考値はあるが、情報源が未登録のため Web では公開準備中の食品（一覧に名前だけ出す） */
export const pendingFoods: readonly WebFood[] = allFoods.filter((f) => hasWebReference(f) && !isPublished(f));
/** 参考値がない食品（一覧に理由つきで出す） */
export const noReferenceFoods: readonly WebFood[] = allFoods.filter((f) => !hasWebReference(f));

const byId = new Map(allFoods.map((f) => [f.foodId, f]));
export const getFood = (foodId: string): WebFood | undefined => byId.get(foodId);

/** 一覧の見出し（表示順） */
export const CATEGORY_LABELS: Record<string, string> = {
  soy_dairy: '大豆製品・乳製品',
  egg_processed_meat: '卵・ハム・ソーセージ',
  fish_paste_pickles: '練り物・漬物',
  bread: 'パン',
  frozen: '冷凍食品',
  shelf_stable: '麺・お菓子・飲料',
  dry_noodles: '乾麺',
  grain: '米・餅',
  dried: '乾物',
  seasoning: '調味料',
  seasoning_food: 'カレールーなど',
  powder: '粉類',
  oil: '油',
  canned: '缶詰・瓶詰',
  beverage: 'コーヒー・お茶',
  raw_meat_fish: '肉・魚',
  deli: '惣菜・弁当',
  produce: '野菜・果物',
  homemade: '自炊',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? 'その他';
}

/** カテゴリごとにまとめる（CATEGORY_LABELS の順） */
export function groupByCategory(foods: readonly WebFood[]): { category: string; label: string; foods: WebFood[] }[] {
  const order = Object.keys(CATEGORY_LABELS);
  const groups = new Map<string, WebFood[]>();
  for (const f of foods) groups.set(f.category, [...(groups.get(f.category) ?? []), f]);
  return [...groups.entries()]
    .sort(([a], [b]) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999))
    .map(([category, list]) => ({ category, label: categoryLabel(category), foods: list }));
}

/** 同じカテゴリの公開食品（自分以外、最大 limit 件） */
export function relatedFoods(food: WebFood, limit = 6): WebFood[] {
  return publishedFoods.filter((f) => f.category === food.category && f.foodId !== food.foodId).slice(0, limit);
}

/** 主要な食品（ページがあるものだけ。アクセス数の順位ではない） */
export function popularFoods(): WebFood[] {
  return siteConfig.popularFoodIds
    .map((id) => getFood(id))
    .filter((f): f is WebFood => f !== undefined && isPublished(f))
    .slice(0, siteConfig.popularLimit);
}

/**
 * 検索用の文字正規化（アプリの src/lib/normalize.ts と同じ処理。public/search.js にも同じものがある）
 * 全角英数→半角、英字→小文字、カタカナ→ひらがな、空白除去
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/\s+/g, '');
}

/** 一覧の検索に使う語（名前・別名・キーワード）を正規化して | でつなぐ */
export function searchTerms(food: WebFood): string {
  return [food.displayName, ...food.aliases, ...food.keywords].map(normalizeText).join('|');
}
