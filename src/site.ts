/**
 * site.config.ts から決まる値（URL の組み立てなど）。
 */
import { siteConfig } from '../site.config.ts';

const url = new URL(siteConfig.siteUrl);

/** サイトの置き場所のパス。例：'/kigen-plus'（独自ドメインなら ''） */
export const BASE_PATH = url.pathname.replace(/\/+$/, '');

/** サイト内リンク用のパス：path('/foods/') → '/kigen-plus/foods/' */
export function path(p: string): string {
  return `${BASE_PATH}${p}`;
}

/** canonical・OGP・sitemap 用の絶対URL：absUrl('/foods/') → 'https://…/kigen-plus/foods/' */
export function absUrl(p: string): string {
  return `${url.origin}${BASE_PATH}${p}`;
}

export const hasAppStoreUrl = siteConfig.appStoreUrl.startsWith('https://');

/**
 * サイトの出力先フォルダ（website/ の中）。
 * 「.nosync」で終わる名前は iCloud Drive が同期しないため、デスクトップが iCloud 同期されていても
 * ビルドのたびに同期と衝突して「foods 2」のような重複フォルダができたり、止まったりしない。
 */
export const DIST_DIR = 'dist.nosync';
