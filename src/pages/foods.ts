import { groupByCategory, noReferenceFoods, pendingFoods, popularFoods, publishedFoods, searchTerms } from '../foods.ts';
import { html, type Raw } from '../html.ts';
import { page } from '../layout.ts';
import { path } from '../site.ts';
import type { WebFood } from '../types.ts';

/** 一覧の1行に出す短い参考表示 */
function summary(f: WebFood): Raw {
  const d = f.display;
  if (d.status === 'VALUE') {
    return html`<span class="item-ref">ネット参考 <b>${d.typical}</b>${d.range ? html` <span class="item-range">参考レンジ ${d.range}</span>` : null}</span>`;
  }
  if (d.status === 'NO_FIXED_LIMIT') return html`<span class="item-ref">ネット参考 <b>一律の日数目安なし</b></span>`;
  if (d.status === 'NO_EXPIRATION') return html`<span class="item-ref">期限表示なしの食品として管理</span>`;
  if (d.status === 'QUALITY_BASED') return html`<span class="item-ref">品質で判断する食品として管理</span>`;
  return html`<span class="item-ref">${d.hiddenReason}</span>`;
}

function linkedItem(f: WebFood): Raw {
  return html`<li class="food-item" data-terms="${searchTerms(f)}"><a href="${path(`/foods/${f.slug}/`)}">
  <span class="item-name">${f.displayName}</span>
  ${summary(f)}
  ${f.display.status === 'VALUE' || f.display.status === 'NO_FIXED_LIMIT' ? html`<span class="item-cond">賞味期限・${f.display.condition}</span>` : null}
</a></li>`;
}

/** ページを作らない食品：名前と理由だけ（参考値は出さない） */
function plainItem(f: WebFood, note: string): Raw {
  return html`<li class="food-item is-plain" data-terms="${searchTerms(f)}"><div>
  <span class="item-name">${f.displayName}</span>
  <span class="item-ref">${note}</span>
</div></li>`;
}

/** 情報源が未登録の食品：数値は Web に出さない */
const PENDING_NOTE = 'ネット参考：Webでは公開準備中（KIGEN+アプリで確認できます）';

export function renderFoods(): string {
  const popular = popularFoods();
  const groups = groupByCategory(publishedFoods);

  const body = html`
<div class="wrap narrow page">
  <h1 class="page-title">食品一覧</h1>
  <p class="page-lead">KIGEN+に登録されている食品の、賞味期限のネット参考を確認できます。ネット上の情報をもとにした参考値で、食品の安全性を保証するものではありません。</p>

  <form class="search-form" action="${path('/foods/')}" method="get" role="search" data-food-search>
    <label for="food-search" class="visually-hidden">食品名を検索</label>
    <input id="food-search" name="q" type="search" placeholder="食品名を検索" autocomplete="off" enterkeyhint="search" aria-describedby="search-status">
    <button type="submit" class="btn btn-primary btn-small">検索</button>
  </form>
  <p id="search-status" class="search-status" role="status" aria-live="polite"></p>

  <section class="popular" aria-labelledby="popular-title" data-hide-on-search>
    <h2 id="popular-title" class="list-title">主要な食品</h2>
    <ul class="food-chips">
      ${popular.map((f) => html`<li><a href="${path(`/foods/${f.slug}/`)}">${f.displayName}</a></li>`)}
    </ul>
  </section>

  ${groups.map(
    (g) => html`<section class="food-group" aria-labelledby="cat-${g.category}" data-group>
    <h2 id="cat-${g.category}" class="list-title">${g.label}</h2>
    <ul class="food-list">${g.foods.map(linkedItem)}</ul>
  </section>`
  )}

  ${pendingFoods.length
    ? html`<section class="food-group" aria-labelledby="pending-title" data-group>
    <details class="no-ref" data-collapsible>
      <summary><h2 id="pending-title" class="list-title">Webでは公開準備中の食品（${pendingFoods.length}）</h2></summary>
      <p class="small muted">KIGEN+のアプリではネット参考を表示していますが、情報源の確認が済んでいないため、Webでの公開を準備している食品です。</p>
      <ul class="food-list">${pendingFoods.map((f) => plainItem(f, PENDING_NOTE))}</ul>
    </details>
  </section>`
    : null}

  <section class="food-group" aria-labelledby="no-ref-title" data-group>
    <details class="no-ref" data-collapsible>
      <summary><h2 id="no-ref-title" class="list-title">ネット参考値がない食品（${noReferenceFoods.length}）</h2></summary>
      <p class="small muted">KIGEN+のアプリでは登録・記録できますが、ネット参考値を設定していない食品です。消費期限の食品や生の肉・魚、惣菜などは、期限を過ぎたあとの参考値を表示しません。</p>
      <ul class="food-list">${noReferenceFoods.map((f) => plainItem(f, f.display.hiddenReason ?? 'ネット参考値はありません。'))}</ul>
    </details>
  </section>

  <p class="search-empty" data-search-empty hidden>見つかりませんでした。ひらがな・別の呼び方でも検索できます。</p>
  <p class="small muted list-foot">KIGEN+ は、食品の安全性や食べられるかどうかを判定するものではありません。</p>
</div>
`;

  return page(
    {
      path: '/foods/',
      title: '食品一覧｜賞味期限のネット参考を食品から調べる｜KIGEN+',
      description: `醤油・味噌・焼きのり・ツナ缶など、KIGEN+に登録された${publishedFoods.length}食品の賞味期限のネット参考（期限から何日たったかの参考値）を確認できます。食品の安全性を保証するものではありません。`,
      breadcrumbs: [{ name: '食品一覧', path: '/foods/' }],
      scripts: ['search.js'],
    },
    body
  );
}
