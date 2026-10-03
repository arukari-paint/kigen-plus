/**
 * 全ページ共通の枠（<head>・ヘッダー・フッター・パンくず）と、App Store ボタン。
 */
import { siteConfig } from '../site.config.ts';
import { html, jsonForScript, raw, type Raw } from './html.ts';
import { absUrl, hasAppStoreUrl, path } from './site.ts';

export type Crumb = { name: string; path: string };

export type PageMeta = {
  /** サイト内のパス（例：'/foods/natto/'） */
  path: string;
  title: string;
  description: string;
  /** OGP の種類（TOP は website、それ以外は article） */
  ogType?: 'website' | 'article';
  /** パンくず（TOP を除く。最後は現在のページ） */
  breadcrumbs?: Crumb[];
  /** 追加の構造化データ */
  jsonLd?: object[];
  /** 検索結果に出さないページ（404 など） */
  noindex?: boolean;
  /** ページ固有のスクリプト（public/ のファイル名） */
  scripts?: string[];
  /** <body> の class */
  bodyClass?: string;
};

/** CSS・JS の更新をブラウザのキャッシュに反映させるための値（ビルドごとに変わる） */
export const ASSET_VERSION = Date.now().toString(36);

function breadcrumbJsonLd(crumbs: Crumb[]): object {
  const items = [{ name: 'TOP', path: '/' }, ...crumbs];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.path),
    })),
  };
}

/** AdSense のサイト運営者IDが設定されているか */
export const hasAdsense = /^ca-pub-\d{10,}$/.test(siteConfig.adsense.client);

/** AdSense のコード（審査・所有権の確認にも使う）。ID が空なら何も出さない */
function adsenseHead(): Raw | null {
  if (!hasAdsense) return null;
  const client = siteConfig.adsense.client;
  return html`<meta name="google-adsense-account" content="${client}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`;
}

/**
 * 広告枠（ページ下部だけに置く）。ID が未設定なら何も出さない。
 * 参考値・注意書きと離すため、食品ページでは KIGEN+ の案内と関連食品より下に置く。
 */
export function adSlot(location: keyof typeof siteConfig.adsense.slots): Raw | null {
  const slot = siteConfig.adsense.slots[location];
  if (!hasAdsense || !/^\d+$/.test(slot)) return null;
  return html`<aside class="ad-area" aria-label="広告">
  <p class="ad-label">広告</p>
  <ins class="adsbygoogle" style="display:block" data-ad-client="${siteConfig.adsense.client}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</aside>`;
}

function analytics(): Raw | null {
  const id = siteConfig.gaMeasurementId;
  if (!/^G-[A-Z0-9]+$/.test(id)) return null;
  return html`<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${raw(JSON.stringify(id))});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-app-store]');if(a)gtag('event','app_store_click',{link_location:a.getAttribute('data-app-store')});});</script>`;
}

export function page(meta: PageMeta, body: Raw): string {
  const canonical = absUrl(meta.path);
  const ogImage = absUrl('/images/og.png');
  const jsonLd = [...(meta.breadcrumbs?.length ? [breadcrumbJsonLd(meta.breadcrumbs)] : []), ...(meta.jsonLd ?? [])];

  return `<!doctype html>\n${html`<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<meta name="description" content="${meta.description}">
${meta.noindex ? html`<meta name="robots" content="noindex">` : html`<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#EFE9DC">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no, email=no">
<meta property="og:site_name" content="${siteConfig.siteName}">
<meta property="og:locale" content="ja_JP">
<meta property="og:type" content="${meta.ogType ?? 'article'}">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="KIGEN+ 賞味期限のその先へ">
<meta name="twitter:card" content="summary_large_image">
${siteConfig.googleSiteVerification ? html`<meta name="google-site-verification" content="${siteConfig.googleSiteVerification}">` : null}
<link rel="icon" href="${path('/favicon.png')}" type="image/png">
<link rel="apple-touch-icon" href="${path('/images/apple-touch-icon.png')}">
<link rel="stylesheet" href="${path(`/styles.css?v=${ASSET_VERSION}`)}">
${jsonLd.map((d) => html`<script type="application/ld+json">${jsonForScript(d)}</script>\n`)}
${analytics()}
${adsenseHead()}
</head>
<body${meta.bodyClass ? raw(` class="${meta.bodyClass}"`) : ''}>
<a class="skip" href="#main">本文へスキップ</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="logo" href="${path('/')}" aria-label="KIGEN+ トップページ">KIGEN<span>+</span></a>
    <nav aria-label="メインメニュー">
      <ul class="nav">
        <li><a href="${path('/foods/')}">食品から調べる</a></li>
        <li><a href="${path('/about/')}">KIGEN+について</a></li>
      </ul>
    </nav>
  </div>
</header>
${meta.breadcrumbs?.length ? breadcrumbNav(meta.breadcrumbs) : null}
<main id="main">
${body}
</main>
${footer()}
${(meta.scripts ?? []).map((s) => html`<script src="${path(`/${s}?v=${ASSET_VERSION}`)}" defer></script>\n`)}
</body>
</html>
`}`;
}

function breadcrumbNav(crumbs: Crumb[]): Raw {
  const items = [{ name: 'TOP', path: '/' }, ...crumbs];
  return html`<nav class="wrap breadcrumb" aria-label="パンくずリスト"><ol>${items.map((c, i) =>
    i === items.length - 1
      ? html`<li><span aria-current="page">${c.name}</span></li>`
      : html`<li><a href="${path(c.path)}">${c.name}</a></li>`
  )}</ol></nav>`;
}

function footer(): Raw {
  return html`<footer class="site-footer">
  <div class="wrap">
    <p class="footer-logo">KIGEN<span>+</span> <small>${siteConfig.tagline}</small></p>
    <ul class="footer-links">
      <li><a href="${path('/foods/')}">食品一覧</a></li>
      <li><a href="${path('/about/')}">KIGEN+について</a></li>
      <li><a href="${path('/support/')}">サポート</a></li>
      <li><a href="${path('/privacy/')}">プライバシーポリシー</a></li>
      <li><a href="${path('/disclaimer/')}">利用上の注意</a></li>
      ${hasAppStoreUrl ? html`<li><a href="${siteConfig.appStoreUrl}" rel="noopener" data-app-store="footer">App Store</a></li>` : null}
    </ul>
    <p class="footer-note">KIGEN+ は、食品の安全性や食べられるかどうかを判定するアプリではありません。</p>
    <p class="copyright">© ${new Date().getFullYear()} ${siteConfig.copyrightName}</p>
  </div>
</footer>`;
}

/**
 * App Store ボタン。URL が未設定のときはリンクにせず、検索の案内を出す（架空URLを作らないため）。
 * @param location どこのボタンか（Google Analytics のイベントで使う）
 */
export function appStoreButton(location: string, variant: 'primary' | 'light' = 'primary'): Raw {
  if (!hasAppStoreUrl) {
    return html`<p class="store-fallback">App Store で「KIGEN+」と検索してください</p>`;
  }
  return html`<a class="btn btn-${variant}" href="${siteConfig.appStoreUrl}" rel="noopener" data-app-store="${location}">App Storeで見る</a>`;
}
