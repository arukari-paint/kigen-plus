/**
 * 食品詳細ページ（/foods/[slug]/）。data/foods.json の1件から自動で作る。
 * 方針：短く。食品名 → 代表値 → 参考レンジ → 条件 → 注意書き → 情報源 → KIGEN+ の順。
 */
import { foodData, relatedFoods } from '../foods.ts';
import { html, type Raw } from '../html.ts';
import { adSlot, appStoreButton, page } from '../layout.ts';
import { path } from '../site.ts';
import type { FoodSource, SourceType, WebFood } from '../types.ts';

const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  SURVEY: '調査',
  PUBLIC: '公的機関・業界団体',
  MANUFACTURER: 'メーカー',
  EXPERT_ARTICLE: '専門家監修記事',
  MEDIA: '一般メディア',
  PERSONAL_EXPERIENCE: '個人の体験',
};

const CAUTION =
  'ネット上の情報をもとにした参考値です。現在の食品の安全性を保証するものではありません。保存状態、商品、開封状態などによって食品の状態は異なります。';

/** 「賞味期限・未開封・冷蔵の場合」 */
const conditionText = (f: WebFood) => `賞味期限・${f.display.condition}`;

export function foodTitle(f: WebFood): string {
  const d = f.display;
  if (d.status === 'VALUE' && d.typical) {
    return `${f.displayName}の賞味期限｜ネット参考 ${d.typical}${d.range ? `・参考レンジ ${d.range}` : ''}｜KIGEN+`;
  }
  if (d.status === 'NO_FIXED_LIMIT') return `${f.displayName}の賞味期限｜ネット参考を確認｜KIGEN+`;
  return `${f.displayName}の賞味期限について｜KIGEN+での扱い`;
}

export function foodDescription(f: WebFood): string {
  const d = f.display;
  const cond = conditionText(f).replace(/の場合$/, '');
  if (d.status === 'VALUE') {
    return `${f.displayName}の賞味期限が切れてから何日たったかを見比べるための、KIGEN+のネット参考です。代表値${d.typical}${
      d.range ? `、参考レンジ${d.range}` : ''
    }（${cond}の場合）。食品の安全性を保証するものではありません。`;
  }
  if (d.status === 'NO_FIXED_LIMIT') {
    return `${f.displayName}の賞味期限について、KIGEN+に登録されたネット参考を確認できます。一律の日数目安は設けていない食品です（${cond}の場合）。食品の安全性を保証するものではありません。`;
  }
  return `${f.displayName}の期限について、KIGEN+での扱いと参考情報を確認できます。KIGEN+では、${d.hiddenReason ?? ''}`;
}

/** 情報源の運営者が数値を保証しているように見えないよう、一覧の前に必ず添える */
const SOURCE_NOTE =
  '参考値は、KIGEN+が下記の情報をもとに独自にまとめたものです。各情報源の運営者が作成・監修したものではありません。';

function sourceList(sources: FoodSource[]): Raw {
  return html`<p class="source-note">${SOURCE_NOTE}</p><ul class="source-list">${sources.map(
    (s) => html`<li>${
      s.url
        ? html`<a href="${s.url}" rel="noopener nofollow" target="_blank">${s.title}</a>`
        : html`<span>${s.title}</span>`
    } <span class="source-type">（${SOURCE_TYPE_LABEL[s.sourceType] ?? 'その他'}）</span></li>`
  )}</ul>`;
}

/** 参考値のカード（ファーストビューに入るように、ここを最初に置く） */
function referenceCard(f: WebFood): Raw {
  const d = f.display;
  const notes = [f.note, f.catalogNote].filter((n): n is string => !!n);

  if (d.status === 'VALUE') {
    return html`<section class="ref-card" aria-labelledby="ref-title">
  <h2 id="ref-title" class="ref-label">賞味期限のネット参考</h2>
  <p class="ref-value">${d.typical}${d.typicalApprox ? html`<small>${d.typicalApprox}</small>` : null}</p>
  <p class="ref-value-sub">ネット参考の代表値</p>
  <dl class="ref-rows">
    ${d.range ? html`<div><dt>参考レンジ</dt><dd><b>${d.range}</b>${d.rangeApprox ? html` <small>${d.rangeApprox}</small>` : null}</dd></div>` : null}
    <div><dt>条件</dt><dd>${conditionText(f)}</dd></div>
  </dl>
  ${notes.map((n) => html`<p class="ref-note">${n}</p>`)}
  <p class="caution">※${CAUTION}</p>
</section>`;
  }

  if (d.status === 'NO_FIXED_LIMIT') {
    return html`<section class="ref-card" aria-labelledby="ref-title">
  <h2 id="ref-title" class="ref-label">賞味期限のネット参考</h2>
  <p class="ref-value ref-value-text">一律の日数目安なし</p>
  <dl class="ref-rows">
    <div><dt>条件</dt><dd>${conditionText(f)}</dd></div>
  </dl>
  ${notes.map((n) => html`<p class="ref-note">${n}</p>`)}
  <p class="caution">※${CAUTION}</p>
</section>`;
  }

  // 期限表示なし（塩・砂糖）・品質で判断（米）：「+○日」は出さない
  return html`<section class="ref-card" aria-labelledby="ref-title">
  <h2 id="ref-title" class="ref-label">ネット参考</h2>
  <p class="ref-value ref-value-text">「+○日」の参考値はありません</p>
  <p class="ref-note">KIGEN+では、${d.hiddenReason}</p>
  ${f.catalogNote ? html`<p class="ref-note">${f.catalogNote}</p>` : null}
  <p class="caution">※KIGEN+の情報は、食品の安全性を保証するものではありません。保存状態や商品によって食品の状態は異なります。</p>
</section>`;
}

function sourcesSection(f: WebFood): Raw {
  const isValue = f.display.status === 'VALUE' || f.display.status === 'NO_FIXED_LIMIT';
  return html`<details class="sources">
  <summary><h2 class="sources-title">参考情報を見る${f.sources.length ? `（${f.sources.length}件）` : ''}</h2></summary>
  <div class="sources-body">
    ${f.sources.length
      ? sourceList(f.sources)
      : html`<p class="muted">この食品の情報源は現在整理中です。</p>`}
    ${isValue
      ? html`<p>${foodData.texts.definition}${foodData.texts.notSafety}</p>
    <p>代表値は、確認できた期限超過の情報から極端な値を避けて設定した参考値です。参考レンジは、確認できた情報のおおよその幅です。未開封で、一般的な保存方法で保管されていた場合の情報をもとにしています。開封済みの食品や、消費期限の食品には当てはまりません。</p>`
      : null}
    <p class="muted small">参考データ ver.${foodData.datasetVersion}（${formatDate(foodData.lastReviewedAt)} 時点）</p>
  </div>
</details>`;
}

function openedSection(f: WebFood): Raw | null {
  const o = f.opened;
  if (!o) return null;
  return html`<section class="opened" aria-labelledby="opened-title">
  <h2 id="opened-title" class="sub-title">開封後参考</h2>
  ${o.value ? html`<p class="opened-value">${o.value}<small>${o.condition}</small></p>` : null}
  ${o.note ? html`<p>${o.note}</p>` : null}
  <p class="small muted">開封から何日くらいを目安にしている情報があるかを示すもので、上のネット参考（賞味期限を過ぎたあと）とは別の情報です。商品の表示を優先してください。</p>
  ${o.sources.length ? html`<details class="sources sources-inline"><summary>開封後参考の情報源（${o.sources.length}件）</summary><div class="sources-body">${sourceList(o.sources)}</div></details>` : null}
</section>`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

export function renderFood(f: WebFood): string {
  const related = relatedFoods(f);

  const body = html`
<article class="wrap narrow page food">
  <h1 class="food-name">${f.displayName}</h1>
  ${referenceCard(f)}
  ${sourcesSection(f)}
  ${openedSection(f)}

  <section class="cta-card" aria-labelledby="cta-title">
    <h2 id="cta-title">期限から何日たったか、<br>KIGEN+で記録。</h2>
    <p>KIGEN+なら、食品の期限を登録して<br>現在の日数・ネット参考・自分の記録を<br>まとめて確認できます。</p>
    ${appStoreButton('food_detail')}
  </section>

  ${related.length
    ? html`<section class="related" aria-labelledby="related-title">
    <h2 id="related-title" class="sub-title">同じカテゴリの食品</h2>
    <ul class="food-chips">${related.map((r) => html`<li><a href="${path(`/foods/${r.slug}/`)}">${r.displayName}</a></li>`)}</ul>
  </section>`
    : null}

  <p class="back-link"><a href="${path('/foods/')}">← 食品一覧へ戻る</a></p>

  ${adSlot('food')}
</article>
`;

  return page(
    {
      path: `/foods/${f.slug}/`,
      title: foodTitle(f),
      description: foodDescription(f),
      breadcrumbs: [
        { name: '食品一覧', path: '/foods/' },
        { name: f.displayName, path: `/foods/${f.slug}/` },
      ],
    },
    body
  );
}
