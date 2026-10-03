/**
 * About・サポート・プライバシーポリシー・利用上の注意・404。
 */
import { siteConfig } from '../../site.config.ts';
import { html } from '../html.ts';
import { appStoreButton, hasAdsense, page } from '../layout.ts';
import { absUrl, path } from '../site.ts';

const hasGa = /^G-[A-Z0-9]+$/.test(siteConfig.gaMeasurementId);

export function renderAbout(): string {
  const body = html`
<div class="wrap narrow page prose">
  <h1 class="page-title">KIGEN+について</h1>
  <p class="lead">KIGEN+は、食品の期限から何日たったか、ネット上の参考情報、自分の記録を見比べるためのアプリです。</p>
  <p>食品が食べられるかどうかを判定するアプリではありません。</p>

  <h2>できること</h2>
  <ul>
    <li>賞味期限・消費期限の登録</li>
    <li>期限まであと何日か、期限から何日たったかの表示</li>
    <li>食品ごとのネット参考の確認</li>
    <li>「食べた」「捨てた」の記録と、MY RECORD でのふり返り</li>
    <li>食べたあと3時間後・24時間後の状態の記録（食後フォロー）</li>
    <li>食品の検索</li>
  </ul>

  <h2>ネット参考とは</h2>
  <p>ネット上で見られる、賞味期限を過ぎた食品についての情報をもとにした参考値です。安全期限ではありません。この日数までなら安全、という意味ではなく、この日数を超えたら危険、という意味でもありません。</p>
  <p>未開封で、一般的な保存方法で保管されていた場合の情報をもとにしています。消費期限の食品や、生の肉・魚、惣菜などには参考値を表示しません。食品ごとのネット参考は<a href="${path('/foods/')}">食品一覧</a>で確認できます。</p>

  <h2>データの保存について</h2>
  <p>アカウント登録・ログインは不要です。記録した内容は、お使いの端末の中に保存されます。詳しくは<a href="${path('/privacy/')}">プライバシーポリシー</a>をご覧ください。</p>

  <h2>ご利用にあたって</h2>
  <p>食べるかどうかは、実際の状態を確かめたうえでご自身で判断してください。詳しくは<a href="${path('/disclaimer/')}">利用上の注意</a>をご覧ください。</p>

  <div class="cta-card">
    <p class="cta-brand">KIGEN<span>+</span></p>
    <p>iPhone 用・無料（広告表示あり）</p>
    ${appStoreButton('about')}
  </div>
</div>`;
  return page(
    {
      path: '/about/',
      title: 'KIGEN+について｜期限・ネット参考・自分の記録を見比べるアプリ',
      description:
        'KIGEN+は、食品の期限から何日たったか、ネット上の参考情報、自分の記録を見比べるためのアプリです。食品が食べられるかどうかを判定するアプリではありません。',
      breadcrumbs: [{ name: 'KIGEN+について', path: '/about/' }],
    },
    body
  );
}

/**
 * サポート（/support/）。使い方とよくある質問のページ（Webサイトには問い合わせ先を載せない）。
 * App Store の Support URL・アプリの設定画面から開かれる可能性があるため、URL は残している。
 */
export function renderSupport(): string {
  const body = html`
<div class="wrap narrow page prose">
  <h1 class="page-title">KIGEN+ サポート</h1>
  <p class="lead">KIGEN+の使い方と、よくある質問です。</p>

  <h2>アプリについて</h2>
  <p>KIGEN+は、食品の期限を記録して、期限から何日たったか、ネット上の参考情報、自分の「食べた」「捨てた」の記録を見比べるためのアプリです（iPhone 用・無料）。</p>
  <p>食品の安全性や、食べられるかどうかを判定するアプリではありません。</p>

  <h2>基本的な使い方</h2>
  <ol>
    <li>ホームの「食品を追加」から、食品名・期限の種類（賞味期限／消費期限／期限表示なし）・期限日・開封状態・保存方法を登録します。</li>
    <li>ホームに「あと3日」「今日まで」「+6日」のように、期限までの日数・期限からの日数で並びます。</li>
    <li>食品をタップすると、「現在」「ネット参考」「あなたの記録」を並べて確認できます。</li>
    <li>食べたら「食べた」、処分したら「捨てた」を押すと、そのときの期限からの日数が記録されます。</li>
    <li>「食べた」を記録すると、3時間後・24時間後の状態を記録できます（食後フォロー）。</li>
    <li>「履歴」で記録の一覧を、「MY RECORD」で食品ごとの記録をふり返れます。</li>
  </ol>

  <h2>よくある質問</h2>

  <h3>記録したデータはどこに保存されますか？</h3>
  <p>お使いの端末の中にだけ保存されます。アカウント登録・ログインはなく、記録した内容が外部に送信されることはありません。アプリを削除すると、記録も消えます。</p>

  <h3>食後フォローの通知が届きません</h3>
  <p>食後フォローの通知は、端末の中で予約される通知です。端末の「設定」→「通知」→「KIGEN+」で、通知が許可されているか確認してください。アプリ内の「設定」画面から、端末の設定を開くこともできます。通知を使わなくても、記録の詳細画面から食後フォローを記録できます。</p>

  <h3>「ネット参考」とは何ですか？</h3>
  <p>ネット上で見られる、賞味期限を過ぎた食品についての情報をもとにした参考値です。安全期限ではありません。この日数までなら安全、という意味ではなく、この日数を超えたら危険、という意味でもありません。</p>
  <p>未開封で、一般的な保存方法で保管されていた場合の情報をもとにしています。そのため、開封済みの食品・保存方法が異なる食品・消費期限の食品には、ネット参考の数値を表示しません。数値の根拠は、アプリ内の「この数値について」や、このサイトの<a href="${path('/foods/')}">食品一覧</a>で確認できます。</p>

  <h3>広告が表示されます</h3>
  <p>無料でお使いいただけるよう、画面下部に広告（Google AdMob）を表示しています。広告のために、記録した食品の内容が送信されることはありません。詳しくは<a href="${path('/privacy/')}">プライバシーポリシー</a>をご覧ください。</p>

  <h2>食品の安全に関する注意</h2>
  <p>ネット参考や過去の記録は、今回の食品の安全性を保証するものではありません。食品の状態は、保存状態・開封状態・温度・商品などによって異なります。食べるかどうかは、商品の表示を確認し、実際の状態を確かめたうえでご自身で判断してください。体調に不安がある場合は、医療機関にご相談ください。</p>

  <h2>関連ページ</h2>
  <ul>
    <li><a href="${path('/about/')}">KIGEN+について</a></li>
    <li><a href="${path('/privacy/')}">プライバシーポリシー</a></li>
    <li><a href="${path('/disclaimer/')}">利用上の注意</a></li>
  </ul>
</div>`;
  return page(
    {
      path: '/support/',
      title: 'KIGEN+ サポート｜使い方・よくある質問',
      description:
        'KIGEN+（賞味期限のその先へ）の使い方とよくある質問。データの保存、食後フォローの通知、ネット参考、広告、食品の安全に関する注意について説明しています。',
      breadcrumbs: [{ name: 'サポート', path: '/support/' }],
    },
    body
  );
}

/**
 * プライバシーポリシー。
 * アプリの実装（src/lib/ads/・src/lib/notifications.ts・app.json）を確認した内容。
 * 情報の取り扱いが変わる機能を追加したら、ここと制定日・改定日を更新する。
 */
export function renderPrivacy(): string {
  const body = html`
<div class="wrap narrow page prose">
  <h1 class="page-title">プライバシーポリシー</h1>
  <p class="muted small">制定日：2026年9月27日（広告の導入にあわせて同日改定）<br>改定日：2026年10月3日（公式Webサイトについての項目を追加）</p>

  <p>KIGEN+（以下「本アプリ」）は、食品の期限と、ご自身の「食べた」「捨てた」の記録を管理するためのアプリです。本アプリと、本アプリの公式Webサイト（以下「本サイト」）における情報の取り扱いについて、以下のとおり定めます。</p>

  <h2>1. 開発者が収集する情報</h2>
  <p>開発者が、利用者の個人情報や、アプリに記録した内容を収集することはありません。</p>
  <ul>
    <li>アカウント登録・ログインはありません。</li>
    <li>氏名・メールアドレス・位置情報・連絡先などを、開発者が取得することはありません。</li>
  </ul>

  <h2>2. 端末に保存される情報</h2>
  <p>利用者が入力した次の情報は、利用者の端末の中にだけ保存されます。広告を含め、外部に送信されることはありません。</p>
  <ul>
    <li>登録した食品の名前・期限日・開封状態・開封日・保存方法・メモ</li>
    <li>「食べた」「捨てた」の記録と、食後フォローの記録</li>
    <li>アプリの設定</li>
  </ul>
  <p>これらの情報は、本アプリを削除すると端末から消去されます。開発者が復元することはできません。</p>

  <h2>3. 広告について</h2>
  <p>本アプリは、無料で提供するために Google LLC の広告配信サービス「Google AdMob」を利用しています。広告の配信にあたり、Google は次のような情報を取得・利用することがあります。</p>
  <ul>
    <li>広告識別子（iPhone の場合、トラッキングを許可した場合のみ）などの端末の識別情報</li>
    <li>IP アドレス、端末の機種・OS などの情報</li>
    <li>広告の表示・タップなどの状況</li>
    <li>不具合の調査のための診断情報</li>
  </ul>
  <p>これらは広告の配信・効果測定・不正防止などに使われます。iPhone では、アプリの起動時に表示されるダイアログで「トラッキングを許可しない」を選ぶと、広告識別子は使われません。この設定は、端末の「設定」→「プライバシーとセキュリティ」→「トラッキング」からいつでも変更できます。お住まいの地域によっては、広告に関する同意の画面が表示されることがあります。</p>
  <p>Google による情報の取り扱いについては、<a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">Google のサービスを使用するサイトやアプリから収集した情報の Google による使用</a>および<a href="https://policies.google.com/privacy" rel="noopener" target="_blank">Google プライバシーポリシー</a>をご確認ください。</p>

  <h2>4. 通知について</h2>
  <p>食後フォローの通知は、端末の中で予約される通知（ローカル通知）です。通知のために情報を外部のサーバーへ送信することはありません。通知の許可は、端末の設定からいつでも変更できます。</p>

  <h2>5. 同梱データについて</h2>
  <p>本アプリに含まれる食品データや「ネット参考」の情報は、アプリに同梱されたものです。表示のために外部と通信することはありません。</p>

  <h2>6. 本サイトについて</h2>
  <p>本サイトは GitHub Pages（GitHub, Inc.）で公開しています。本サイトの閲覧にあたり、GitHub がアクセスの記録（IP アドレスなど）を取得することがあります。詳しくは <a href="https://docs.github.com/ja/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener" target="_blank">GitHub のプライバシーステートメント</a>をご確認ください。</p>
  <p>本サイトの食品検索は、お使いのブラウザの中だけで動作し、入力した文字を開発者が収集することはありません。</p>
  ${hasGa
    ? html`<p>本サイトでは、閲覧状況を把握するために Google LLC のアクセス解析ツール「Google アナリティクス」を利用しています。Google アナリティクスは Cookie を使用して、個人を特定しない形で閲覧ページ・利用環境などの情報を収集します。収集される情報は Google のプライバシーポリシーに基づいて管理されます。<a href="https://tools.google.com/dlpage/gaoptout?hl=ja" rel="noopener" target="_blank">Google アナリティクス オプトアウト アドオン</a>を利用すると、収集を無効にできます。</p>`
    : null}
  ${hasAdsense
    ? html`<p>本サイトでは、Google LLC の広告配信サービス「Google AdSense」を利用しています。Google などの第三者配信事業者は Cookie を使用して、利用者が本サイトや他のサイトに過去にアクセスした際の情報に基づいて広告を配信することがあります。パーソナライズ広告は、<a href="https://myadcenter.google.com/" rel="noopener" target="_blank">Google のマイアドセンター</a>で無効にできます。Google による情報の取り扱いについては、<a href="https://policies.google.com/technologies/ads?hl=ja" rel="noopener" target="_blank">Google の広告に関するポリシー</a>をご確認ください。広告のために、アプリに記録した食品の内容が使われることはありません。</p>`
    : null}
  ${!hasGa && !hasAdsense ? html`<p>本サイトでは、アクセス解析ツールや広告は使用していません。</p>` : null}

  <h2>7. 第三者への提供</h2>
  <p>開発者が、利用者の情報を第三者に提供することはありません。ただし、上記「3. 広告について」のとおり、広告の配信にあたって Google が情報を取得することがあります。</p>

  <h2>8. 本ポリシーの変更</h2>
  <p>情報の取り扱いに関わる機能を追加・変更する場合は、本ポリシーを改定し、このページでお知らせします。</p>


  <p class="note">KIGEN+ は、食品の安全性や食べられるかどうかを判定するアプリではありません。</p>
</div>`;
  return page(
    {
      path: '/privacy/',
      title: 'プライバシーポリシー｜KIGEN+',
      description: 'KIGEN+（賞味期限のその先へ）のプライバシーポリシー。記録は端末内に保存され、広告にはGoogle AdMobを利用しています。',
      breadcrumbs: [{ name: 'プライバシーポリシー', path: '/privacy/' }],
    },
    body
  );
}

export function renderDisclaimer(): string {
  const body = html`
<div class="wrap narrow page prose">
  <h1 class="page-title">利用上の注意</h1>
  <p class="lead">KIGEN+および本Webサイトに掲載される情報は、食品の安全性を判定または保証するものではありません。</p>

  <h2>食品の状態について</h2>
  <p>食品の状態は、次のような条件によって異なります。</p>
  <ul>
    <li>保存状態</li>
    <li>開封状態</li>
    <li>温度</li>
    <li>商品</li>
    <li>包装状態</li>
    <li>その他の条件</li>
  </ul>

  <h2>ネット参考について</h2>
  <p>ネット参考は、ネット上の期限超過後の喫食情報等をもとにした参考値です。安全期限ではありません。この日数までなら安全、という意味ではなく、この日数を超えたら危険、という意味でもありません。</p>
  <p>ネット参考は、未開封で、一般的な保存方法で保管されていた場合の情報をもとにしています。開封済みの食品、保存方法が異なる食品、消費期限の食品には当てはまりません。</p>

  <h2>過去の記録について</h2>
  <p>ネット参考や過去の記録は、今回の食品の安全性を保証するものではありません。過去に同じ日数で食べた記録があっても、今回の食品の状態とは関係ありません。</p>

  <h2>消費期限について</h2>
  <p>消費期限は、傷みやすい食品に表示される期限です。KIGEN+では、消費期限の食品について、期限を過ぎたあとの参考値を表示していません。</p>

  <h2>ご判断について</h2>
  <p>食べるかどうかは、商品の表示を確認し、実際の状態を確かめたうえでご自身で判断してください。体調に不安がある場合は、医療機関にご相談ください。</p>
</div>`;
  return page(
    {
      path: '/disclaimer/',
      title: '利用上の注意｜KIGEN+',
      description:
        'KIGEN+および本Webサイトに掲載される情報は、食品の安全性を判定または保証するものではありません。ネット参考や過去の記録の扱いについての注意事項です。',
      breadcrumbs: [{ name: '利用上の注意', path: '/disclaimer/' }],
    },
    body
  );
}

export function renderNotFound(): string {
  const body = html`
<div class="wrap narrow page center">
  <p class="big-code" aria-hidden="true">404</p>
  <h1 class="page-title">ページが見つかりませんでした</h1>
  <p>URLが変わったか、削除された可能性があります。</p>
  <p><a class="btn btn-primary" href="${path('/foods/')}">食品一覧を見る</a></p>
  <p><a href="${path('/')}">トップページへ</a></p>
</div>`;
  return page(
    { path: '/404.html', title: 'ページが見つかりません｜KIGEN+', description: 'お探しのページは見つかりませんでした。KIGEN+の食品一覧またはトップページからお探しください。', noindex: true },
    body
  );
}

/**
 * 以前の URL（privacy.html）。App Store とアプリの設定画面に登録済みのため、新しいページへ転送する。
 */
export function renderRedirect(to: string, title: string): string {
  const target = path(to);
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><title>${title}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${absUrl(to)}">
<meta http-equiv="refresh" content="0; url=${target}">
</head><body><p><a href="${target}">${title}</a>へ移動しました。</p></body></html>
`;
}
