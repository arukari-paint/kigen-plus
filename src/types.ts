/**
 * Webサイト用の食品データ（data/foods.json）の型。
 *
 * data/foods.json は scripts/export-app-data.ts がアプリ（../src/data）から自動で書き出す。
 * 手で編集しないこと（アプリ側のデータを直して、書き出し直す）。
 */

export type ReferenceMode = 'DAYS' | 'NO_FIXED_LIMIT' | 'NO_EXPIRATION' | 'QUALITY_BASED';
export type ReferenceConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type DeadlineType = 'best_before' | 'use_by' | 'no_expiration';
export type StorageMethod = 'room' | 'fridge' | 'freezer';
export type SourceType = 'SURVEY' | 'PUBLIC' | 'MANUFACTURER' | 'EXPERT_ARTICLE' | 'MEDIA' | 'PERSONAL_EXPERIENCE';

export type FoodSource = {
  title: string;
  sourceType: SourceType;
  /** 空文字のときはリンクしない */
  url: string;
};

/**
 * 表示の種類（アプリの lib/reference.ts の判定と同じ）。
 * - VALUE          … 「+○日」の代表値がある
 * - NO_FIXED_LIMIT … 一律の日数目安なし（はちみつ等）
 * - NO_EXPIRATION  … 期限表示なしの食品（塩・砂糖）
 * - QUALITY_BASED  … 品質で判断する食品（米）
 * - NONE           … 表示できる参考値がない
 */
export type ReferenceStatus = 'VALUE' | 'NO_FIXED_LIMIT' | 'NO_EXPIRATION' | 'QUALITY_BASED' | 'NONE';

export type WebFood = {
  foodId: string;
  /** URL に使う文字列（foodId の _ を - にしたもの）。一度公開したら変えない */
  slug: string;
  displayName: string;
  aliases: string[];
  keywords: string[];
  category: string;
  typicalDeadlineType: DeadlineType;
  defaultStorage: StorageMethod;
  /** 初期食品DBの注記（例：製品によっては消費期限表示のものもあります） */
  catalogNote: string | null;

  referenceMode: ReferenceMode;
  referenceMinDays: number | null;
  referenceTypicalDays: number | null;
  referenceMaxDays: number | null;
  /** 内部データ。安全性の確率ではないため、画面には出さない */
  confidence: ReferenceConfidence;
  assumedOpenedStatus: 'unopened';
  assumedStorage: StorageMethod;
  note: string | null;
  sources: FoodSource[];

  /** アプリと同じ関数で作った表示用の文言 */
  display: {
    status: ReferenceStatus;
    /** 「+5日」「一律の日数目安なし」 */
    typical: string | null;
    /** 「約6か月」（60日以上のときだけ） */
    typicalApprox: string | null;
    /** 「+1〜7日」 */
    range: string | null;
    /** 「約1か月〜6か月」 */
    rangeApprox: string | null;
    /** 「未開封・冷蔵の場合」 */
    condition: string;
    /** 数値を出さない理由（status が VALUE 以外のとき） */
    hiddenReason: string | null;
  };

  /** 開封後参考（登録されている食品のみ） */
  opened: {
    /** 「約30日」「30〜60日」。数値が無ければ null（note で伝える） */
    value: string | null;
    /** 「開封後・冷蔵保存の場合」 */
    condition: string;
    note: string | null;
    sources: FoodSource[];
  } | null;
};

export type FoodData = {
  datasetVersion: string;
  lastReviewedAt: string;
  /** アプリの文言（lib/reference.ts）をそのまま使う */
  texts: {
    definition: string;
    notSafety: string;
  };
  foods: WebFood[];
};
