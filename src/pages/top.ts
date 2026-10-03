import { siteConfig } from '../../site.config.ts';
import { popularFoods } from '../foods.ts';
import { html, type Raw } from '../html.ts';
import { appStoreButton, page } from '../layout.ts';
import { absUrl, hasAppStoreUrl, path } from '../site.ts';

/** 実際のアプリのスクリーンショット（public/images。縮小のみで内容は変えていない） */
function screenshot(file: string, alt: string, eager = false): Raw {
  return html`<figure class="phone"><img src="${path(`/images/${file}`)}" alt="${alt}" width="600" height="1301"${
    eager ? html` fetchpriority="high"` : html` loading="lazy"`
  } decoding="async"></figure>`;
}

const FEATURES: { title: [string, string]; body: Raw; image: string; alt: string }[] = [
  {
    title: ['期限から何日たったか、', 'ひと目で。'],
    body: html`<p>登録した食品は「あと3日」「今日まで」「+6日」のように、期限までの日数・期限からの日数で並びます。</p>
      <ul class="chips" aria-label="表示の例"><li>あと3日</li><li>今日まで</li><li>+6日</li></ul>`,
    image: 'screen-home.webp',
    alt: 'KIGEN+のホーム画面。納豆 +6日、豆腐 +1日、スライスチーズ 今日まで のように期限からの日数が並んでいる',
  },
  {
    title: ['ネット上の参考情報と、', '見比べる。'],
    body: html`<p>食品ごとに登録されたネット参考を確認できます。ネット上の情報をもとにした参考値で、食品の安全性を保証するものではありません。</p>`,
    image: 'screen-search.webp',
    alt: 'KIGEN+の検索画面。しょうが・こしょう・醤油などのネット参考が表示されている',
  },
  {
    title: ['自分の記録を、', 'ふり返る。'],
    body: html`<p>「食べた」「捨てた」の記録を、食品ごとに確認できます。過去の記録は、今回の食品の安全性を保証するものではありません。</p>`,
    image: 'screen-my-record.webp',
    alt: 'KIGEN+のMY RECORD画面。食品ごとに過去の記録とネット参考が並んでいる',
  },
  {
    title: ['食べたあとも、', '記録できる。'],
    body: html`<p>「食べた」を記録すると、3時間後・24時間後の状態を記録できます（通知を使わなくても記録できます）。</p>`,
    image: 'screen-followup.webp',
    alt: 'KIGEN+の記録の詳細画面。3時間後・24時間後の食後フォローの欄がある',
  },
];

export function renderTop(): string {
  const popular = popularFoods();

  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.siteName,
      alternateName: `${siteConfig.siteName} ${siteConfig.tagline}`,
      url: absUrl('/'),
      inLanguage: 'ja',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: siteConfig.siteName,
      description: '食品の期限を記録して、期限からの日数・ネット参考・自分の記録を見比べられるアプリ',
      operatingSystem: 'iOS',
      applicationCategory: 'LifestyleApplication',
      inLanguage: 'ja',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      ...(hasAppStoreUrl ? { url: siteConfig.appStoreUrl, downloadUrl: siteConfig.appStoreUrl } : {}),
    },
  ];

  const body = html`
<section class="hero">
  <div class="wrap hero-inner">
    <div class="hero-text">
      <h1 class="hero-brand">KIGEN<span>+</span><small>${siteConfig.tagline}</small></h1>
      <p class="hero-catch"><em>「期限から何日たった？」</em><br>を、すぐ確認。</p>
      <p class="hero-lead">食品の期限を記録して、<br>期限からの日数、ネット参考、自分の記録を<br>見比べられるアプリです。</p>
      <div class="cta-row">${appStoreButton('top_hero')}</div>
      <p class="hero-sub">iPhone 用・無料（広告表示あり）</p>
    </div>
    ${screenshot('screen-detail.webp', 'KIGEN+の食品の詳細画面。納豆が賞味期限から+6日、ネット参考の代表値+5日、自分の記録+5日が並んでいる', true)}
  </div>
</section>

<section class="section features" aria-labelledby="features-title">
  <div class="wrap">
    <h2 id="features-title" class="section-title">KIGEN+でできること</h2>
    <div class="feature-list">
      ${FEATURES.map(
        (f, i) => html`<article class="feature${i % 2 ? ' feature-reverse' : ''}">
        <div class="feature-text">
          <p class="feature-num">0${i + 1}</p>
          <h3>${f.title[0]}<br>${f.title[1]}</h3>
          ${f.body}
        </div>
        ${screenshot(f.image, f.alt)}
      </article>`
      )}
    </div>
    <div class="cta-center">${appStoreButton('top_features')}</div>
  </div>
</section>

<section class="section foodloss" aria-labelledby="foodloss-title">
  <div class="wrap narrow">
    <h2 id="foodloss-title" class="section-title">食べものを、<br>ムダにしない毎日に。</h2>
    <p>家にある食品の期限を記録して、食べ忘れや捨て忘れを減らすために活用できます。</p>
  </div>
</section>

<section class="section search-entry" aria-labelledby="search-title">
  <div class="wrap narrow">
    <h2 id="search-title" class="section-title">食品から調べる</h2>
    <p>KIGEN+に登録されている、食品ごとのネット参考をWebでも確認できます。</p>
    <form class="search-form" action="${path('/foods/')}" method="get" role="search">
      <label for="top-search" class="visually-hidden">食品名を検索</label>
      <input id="top-search" name="q" type="search" placeholder="食品名を検索（例：しょうゆ）" autocomplete="off" enterkeyhint="search">
      <button type="submit" class="btn btn-primary btn-small">検索</button>
    </form>
    <ul class="food-chips" aria-label="よく見られる食品">
      ${popular.map((f) => html`<li><a href="${path(`/foods/${f.slug}/`)}">${f.displayName}</a></li>`)}
    </ul>
    <p class="more-link"><a href="${path('/foods/')}">すべての食品を見る</a></p>
  </div>
</section>

<section class="section final-cta" aria-labelledby="final-title">
  <div class="wrap narrow">
    <h2 id="final-title" class="final-brand">KIGEN<span>+</span><small>${siteConfig.tagline}</small></h2>
    <p>食品の期限と、<br>その後の記録をひとつに。</p>
    <div class="cta-center">${appStoreButton('top_bottom', 'light')}</div>
    <p class="final-note">KIGEN+ は、食品が食べられるかどうかを判定するアプリではありません。</p>
  </div>
</section>
`;

  return page(
    {
      path: '/',
      title: `${siteConfig.siteName}｜${siteConfig.tagline}｜期限から何日たったかを記録するアプリ`,
      description:
        'KIGEN+は、食品の賞味期限・消費期限を記録して、期限から何日たったか、ネット上の参考情報、自分の「食べた・捨てた」の記録を見比べられるiPhoneアプリです。食品の安全性を判定するアプリではありません。',
      ogType: 'website',
      jsonLd,
      bodyClass: 'is-top',
    },
    body
  );
}
