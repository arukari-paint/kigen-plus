/**
 * KIGEN+ 公式Webサイトの設定。URL・連絡先などはここだけを変更する。
 * （canonical・OGP・sitemap.xml・robots.txt・各ページのリンクはすべてここから作られる）
 */

export const siteConfig = {
  /**
   * サイトの公開URL（最後の / は付けない）。
   * 独自ドメインを使うときは、ここを 'https://example.jp' のように変えるだけでよい。
   * パス（/kigen-plus）もここから自動で決まる。
   */
  siteUrl: 'https://arukari-paint.github.io/kigen-plus',

  /**
   * App Store の KIGEN+ のページ。
   * Apple 公式の検索API（bundleId: com.kigenplus.app）で確認した正式なURL。
   * 空文字にすると、ボタンはリンクではなく「App Storeで『KIGEN+』を検索」という案内になる。
   */
  appStoreUrl: 'https://apps.apple.com/jp/app/kigen/id6816483643',

  /**
   * Google Analytics 4 の測定ID（例：'G-XXXXXXXXXX'）。
   * 空のあいだは Google Analytics を一切読み込まない。
   */
  gaMeasurementId: '',

  /**
   * Google Search Console の所有権確認（HTMLタグ方式）に使う content の値。
   * 例：<meta name="google-site-verification" content="abc123..."> の abc123... の部分。
   * 空なら出力しない。
   */
  googleSiteVerification: '',

  siteName: 'KIGEN+',
  tagline: '賞味期限のその先へ',
  /** 著作権表示の名前 */
  copyrightName: 'KIGEN+',

  /**
   * 食品一覧・TOP に「主要な食品」として並べる食品（foodId）。一般の人が調べそうな順。
   * アクセス数の順位ではない（「人気」「ランキング」とは表示しない）。
   * 食品ページが公開されている食品だけが、この順に最大 popularLimit 件表示される（情報源が入れば自動で表示）。
   */
  popularFoodIds: [
    'natto',
    'yogurt',
    'tofu',
    'sliced_cheese',
    'kimchi',
    'soy_sauce',
    'miso',
    'ham',
    'bacon',
    'cup_noodles',
    'chocolate',
    'mayonnaise',
    'ketchup',
  ],
  popularLimit: 10,

  /** 食品ページを公開する条件 */
  publish: {
    /**
     * true（初期値）：情報源（URL）が1件以上登録されている食品だけ、食品ページを作って sitemap.xml に載せる。
     *   情報源のない食品は、食品一覧に「Webでは公開準備中」として名前だけ表示する（参考値は出さない）。
     *   アプリ側で情報源を追加 → npm run data → npm run build で、自動でページ公開・sitemap 追加される。
     * false：アプリでネット参考を表示している食品はすべてページを作る（情報源がない食品は「整理中」と表示）。
     */
    requireSources: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
