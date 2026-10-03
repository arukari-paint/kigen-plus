# KIGEN+ 公式Webサイト

「Google検索 → 食品ページ → ネット参考を見る → KIGEN+を知る → App Store」の入口になる、静的なWebサイトです。

- サーバー・データベース・API・CMS・ログインなし（HTML / CSS と少しの JavaScript だけ）
- GitHub Pages で無料公開。ランニングコストは 0 円（独自ドメインを使う場合だけ年数千円）
- 食品ページは、アプリと同じ食品データから自動で作る（HTML を手で書かない）
- 依存パッケージは開発用の `typescript` と `@types/node` だけ（Node.js の標準機能で TypeScript を実行）

## フォルダ構成

```
website/
  site.config.ts        ← URL・App Store URL・公開条件などの設定（ここだけ変えればよい）
  data/foods.json       ← 食品データ（アプリから自動で書き出す。手で編集しない）
  src/
    build.ts            ← サイトを作る入口（dist.nosync/ に出力）
    foods.ts            ← 食品データの読み込み・ページを作る食品の判定
    layout.ts           ← 全ページ共通の head（title・description・canonical・OGP）・ヘッダー・フッター
    pages/top.ts        ← TOP
    pages/foods.ts      ← 食品一覧（/foods/）
    pages/food.ts       ← 食品詳細のテンプレート（/foods/[slug]/）
    pages/static.ts     ← About・サポート・プライバシーポリシー・利用上の注意・404
  public/               ← そのままコピーされるファイル（CSS・検索用JS・画像・app-ads.txt）
  scripts/
    export-app-data.ts  ← アプリ（../src/data）→ data/foods.json
    check.ts            ← 公開前チェック（リンク切れ・title・canonical・禁止表現など）
    serve.ts            ← 手元で確認するためのサーバー
    make-images.sh      ← スクリーンショット → Web用画像（WebP）・OGP画像
  .github/workflows/deploy.yml ← main に push すると自動で公開
```

## 必要なもの

- Node.js 22.16 以上（`node -v` で確認。Mac なら https://nodejs.org/ からインストール）

最初の1回だけ、このフォルダで次を実行します。

```bash
cd ~/Desktop/appli/kigen-plus/website
npm install
```

## サイトを手元で見る

```bash
npm run dev
```

ブラウザで http://localhost:4321/kigen-plus/ を開きます（止めるときは Ctrl + C）。

## コマンド一覧

| コマンド | 内容 |
|---|---|
| `npm run data` | アプリの食品データから `data/foods.json` を作り直す |
| `npm run build` | サイトを作る（`dist.nosync/` に出力。iCloud Drive に同期されない名前にしている） |
| `npm run check` | 公開前チェック（build のあとに実行） |
| `npm run typecheck` | TypeScript の型チェック |
| `npm run dev` | build して手元のサーバーで表示 |
| `npm run images` | スクリーンショットから Web 用画像・OGP画像を作り直す（撮り直したときだけ） |

## 食品データを更新する（いちばんよく使う作業）

参考値・情報源は **アプリ側だけ** で管理します（Web 側で別に入力しません）。

1. アプリのデータを直す
   - 食品の追加・名前・別名：`../src/data/foodCatalog.ts`
   - ネット参考の値：`../src/data/foodReferences.ts`
   - 情報源：`../src/data/referenceSources.ts`
2. Web 用のデータを書き出して、サイトを作って確認する
   ```bash
   cd ~/Desktop/appli/kigen-plus/website
   npm run data
   npm run build
   npm run check
   ```
3. 公開する（下の「公開する」の 2 回目以降）

食品を追加すると、食品一覧に自動で載ります。情報源（URL）も登録されていれば、食品ページと sitemap.xml にも自動で載ります（食品ごとに公開設定を切り替える作業はありません）。

### どの食品にページを作るか

`src/foods.ts` の `isPublished()` で決めています。

検索エンジンに公開する（= 食品ページを作り、sitemap.xml に載せる）のは、次の両方を満たす食品だけです。

1. ネット参考がある：代表値「+○日」・「一律の日数目安なし」、または期限表示なし（塩・砂糖）・品質で判断（米）の食品。消費期限の食品は除く
2. 情報源がある：URL つきの情報源（`referenceSources.ts`）が1件以上ある（`site.config.ts` の `publish.requireSources: true`）

| 食品の状態 | 食品ページ | sitemap | 食品一覧での表示 |
|---|---|---|---|
| 参考値あり・情報源あり | 作る | 載せる | 参考値つきでリンク |
| 参考値あり・情報源なし（納豆・ヨーグルトなど） | 作らない | 載せない | 「Webでは公開準備中の食品」に名前だけ（数値は出さない） |
| 参考値なし・消費期限の食品 | 作らない | 載せない | 「ネット参考値がない食品」に理由つき |

情報源が未登録の食品も、アプリ側の参考値（`referenceTypicalDays` など）はそのまま残しています。Web で公開するかどうかだけを分けています。
情報源を追加すると、`npm run data` → `npm run build` で自動的にページが作られ、sitemap.xml にも追加されます。
`publish.requireSources` を `false` にすると、情報源がない食品も（「情報源は整理中」と表示して）ページを作ります。

### 表示のルール（アプリと同じ）

- 数値・文言はアプリの `src/lib/reference.ts` の関数で作っています（`npm run data` のとき）
- 「食べられます」「安全です」「○日まで大丈夫」などの表現は使いません。`npm run check` が自動で確認します
- 消費期限の食品には「期限後 +○日」を表示しません
- 信頼度（confidence）はデータとして持っていますが、安全性の確率と誤解されないよう画面には出していません

## 設定を変える（site.config.ts）

| 変えたいもの | 項目 |
|---|---|
| サイトのURL（独自ドメインにしたとき） | `siteUrl` |
| App Store のURL | `appStoreUrl`（空にするとボタンの代わりに「App Storeで『KIGEN+』と検索」と表示） |
| 食品ページを公開する条件 | `publish.requireSources` |
| Google Analytics | `gaMeasurementId`（空のあいだは読み込まない） |
| Search Console の所有権確認（HTMLタグ） | `googleSiteVerification` |
| よく見られる食品 | `popularFoodIds`・`popularLimit`（ページがある食品だけ、この順に表示） |

`siteUrl` を変えると、canonical・OGP・sitemap.xml・robots.txt・サイト内リンクがすべて自動で変わります。
App Store のURLは、Apple の公式検索API（bundleId: com.kigenplus.app）で確認した正式なものを入れています。

## 公開する（GitHub Pages）

公開用のリポジトリは、今のサポートページと同じ **arukari-paint/kigen-plus**（公開URL：https://arukari-paint.github.io/kigen-plus/）です。
このリポジトリには **website フォルダの中身だけ** を入れます（アプリのソースは公開しません）。

### 最初の1回

最初の1回は、今のサポートページ（index.html・privacy.html・style.css）を新しいサイトで置き換えるため `--force` を使います。
**その前に、今のサイトを GitHub 上にもバックアップとして残します**（手順 2）。

1. GitHub で arukari-paint/kigen-plus を開き、**Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする
2. 今のサイトを、GitHub 上のブランチとタグに残す（消さずに置いておくだけで、公開はされません）

   ```bash
   cd ~/Desktop/appli/kigen-plus
   git remote add site https://github.com/arukari-paint/kigen-plus.git
   git fetch site main
   git push site FETCH_HEAD:refs/heads/backup/support-site-2026-09
   git push site site-backup-2026-10-03
   ```

   - `site-backup-2026-10-03` は、このリポジトリに作ってあるタグです（2026年10月3日時点の arukari-paint/kigen-plus の main：コミット 66cc13e「Add files via upload」）
   - GitHub の arukari-paint/kigen-plus の「branches」に `backup/support-site-2026-09` があれば成功です
3. website フォルダの中身を送る

   ```bash
   git add website && git commit -m "公式Webサイトを公開"
   git push site "$(git subtree split --prefix website main)":refs/heads/main --force
   ```

4. GitHub の **Actions** タブで「Deploy website」が緑色（成功）になるのを待つ（1〜2分）
5. 次のURLが開けることを確認する
   - https://arukari-paint.github.io/kigen-plus/ （App Store のサポートURL）
   - https://arukari-paint.github.io/kigen-plus/privacy.html （App Store・アプリのプライバシーポリシーURL。`/privacy/` へ転送される）
   - https://arukari-paint.github.io/kigen-plus/privacy/

### 前のサポートページに戻したいとき

旧サイトは3か所に残っています：GitHub のブランチ `backup/support-site-2026-09`、タグ `site-backup-2026-10-03`（手元と GitHub）、このアプリのリポジトリの履歴（削除前の `site/` フォルダ。内容は同じ）。

- **すぐに戻す（おすすめ）**：GitHub の Settings → Pages → Source を **Deploy from a branch** にし、Branch を `backup/support-site-2026-09`・フォルダ `/ (root)` にして Save。1〜2分で旧サイトが表示されます。新しいサイトに戻すときは Source を **GitHub Actions** に戻します
- **main ごと戻す**：
  ```bash
  cd ~/Desktop/appli/kigen-plus
  git push site 'site-backup-2026-10-03^{commit}:refs/heads/main' --force
  ```
  そのうえで Source を **Deploy from a branch**（main・/ (root)）にします
- **ファイルだけ取り出す**：`git show site-backup-2026-10-03:index.html`（privacy.html・style.css も同様）

### 2回目以降（サイトを更新するとき）

```bash
cd ~/Desktop/appli/kigen-plus
git add website && git commit -m "公式Webサイトを更新"
git push site "$(git subtree split --prefix website main)":refs/heads/main
```

push すると GitHub Actions が自動で「型チェック → build → check → 公開」を行います。
GitHub Actions は公開リポジトリなら無料です。

## Google Search Console（無料）

1. 上の手順でサイトを公開する
2. https://search.google.com/search-console を開く（Google アカウントでログイン）
3. 「プロパティを追加」→ **URL プレフィックス** に `https://arukari-paint.github.io/kigen-plus/` を入力
4. 所有権の確認：**HTML タグ** を選び、表示された `content="…"` の値を `site.config.ts` の `googleSiteVerification` に入れて、公開し直してから「確認」を押す
5. 左のメニュー「サイトマップ」で `sitemap.xml` を送信する
6. 数日〜数週間後、「ページ」（インデックス作成）で登録された食品ページの数を確認する。「URL検査」で個別のページの状態も確認できる

robots.txt について：`/kigen-plus/` のようなプロジェクトサイトでは、検索エンジンはドメインのルート（https://arukari-paint.github.io/robots.txt）を見ます。
`../site-root/robots.txt` を arukari-paint.github.io リポジトリ（app-ads.txt と同じ場所）に置くと sitemap の場所も伝えられます。
独自ドメインにした場合は、このサイトの `dist.nosync/robots.txt` がそのまま使われます。

## 独自ドメインを使う（任意・年数千円）

1. ドメインを購入する（お名前.com・Cloudflare など）
2. ドメインの DNS 設定で、GitHub Pages を指す
   - `www.example.jp` のようなサブドメイン：CNAME レコードで `arukari-paint.github.io` を指す
   - `example.jp`（ルート）：A レコードで GitHub の IP（185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153）を指す
3. GitHub の arukari-paint/kigen-plus → Settings → Pages → **Custom domain** にドメインを入力して Save
4. 数分〜1日後、同じ画面の **Enforce HTTPS** にチェックを入れる（無料の HTTPS 証明書が自動で発行される）
5. `site.config.ts` の `siteUrl` を `https://example.jp` に変えて、公開し直す
6. Search Console に新しいドメインを登録し、sitemap.xml を送信し直す

独自ドメインにしたときの注意：

- App Store Connect のマーケティングURL・サポートURLを新しいURLに変える場合は、AdMob の app-ads.txt も新しいドメインのルート（`https://example.jp/app-ads.txt`）に必要です。このサイトには `public/app-ads.txt` を入れてあるので、ルートに置いた独自ドメインならそのまま公開されます
- アプリの設定画面のリンク（`../src/lib/config.ts` の `PRIVACY_POLICY_URL`・`SUPPORT_URL`）は旧URLのままでも、GitHub が新しいドメインへ転送します

## 画像について（スクリーンショットの差し替え）

サイトの画像は **実際のアプリのスクリーンショット** を縮小・圧縮しただけのものです。文言・数値・色などは変えていません。画像の加工や、AI での描き直しはしないでください。

| サイトの画像（public/images/） | 元のファイル（../store-screenshots/） | 使っている場所 |
|---|---|---|
| screen-detail.webp | 2_detail.png | TOP の最初・OGP画像 |
| screen-home.webp | 1_home_web.png | TOP「期限から何日たったか、ひと目で。」 |
| screen-search.webp | 5_search.png | TOP「ネット上の参考情報と、見比べる。」 |
| screen-my-record.webp | 4_my_record.png | TOP「自分の記録を、ふり返る。」 |
| screen-followup.webp | 3_record_detail.png | TOP「食べたあとも、記録できる。」 |

差し替え方：

1. iPhone で新しいスクリーンショットを撮り、`../store-screenshots/` に上の表の名前で置く（上書き）
2. `npm run images`（cwebp と Google Chrome が必要。OGP画像 og.png も作り直されます）
3. 画面の内容が変わったときは、`src/pages/top.ts` の画像の説明文（alt）も内容に合わせて直す
4. `npm run build && npm run check` → 公開

`../store-screenshots/` はアプリのリポジトリには含めていません（.gitignore）。サイトに使う圧縮済みの画像だけを `public/images/` に入れています。

**TODO：正式版アプリ（App Store 版）から撮影したスクリーンショットへの差し替えを推奨します。**
現在の画像は 2026年9月27日に、App Store 公開前のテスト版で撮影したものです。ホーム画面だけは、左上に「◀ TestFlight」が写っていない画像（1_home_web.png）に差し替え済みです。ほかの画像にテスト版の表示は写っていませんが、正式版で撮り直すとより確実です。

## Google Analytics（後から追加する場合）

1. Google Analytics 4 でプロパティを作り、測定ID（`G-` で始まる）を `site.config.ts` の `gaMeasurementId` に入れる
2. 公開し直す。プライバシーポリシーの「本サイトについて」に Google アナリティクスの説明が自動で追加される
3. 確認できるもの：ページの閲覧（食品ページ）、`search`（食品検索）、`app_store_click`（App Store ボタン。どこのボタンかは `link_location`）

## 公開前チェックリスト

`npm run build && npm run check` で自動確認するもの：title・meta description・canonical・OGP・H1・画像の alt・サイト内リンク切れ・sitemap.xml・robots.txt・禁止表現・公開しない食品のページがないこと・食品ページに情報源があること（requireSources）・sitemap に公開対象の食品だけがあること・お問い合わせ導線（mailto:・メールアドレス・「お問い合わせ」）が残っていないこと。

目で確認するもの：TOP・食品一覧・検索・食品詳細（スマホ / PC）、App Store ボタン、About・Privacy・Disclaimer・404。

## お問い合わせ先について

このWebサイトには、お問い合わせ先・お問い合わせフォーム・mailto: リンク・メールアドレスを載せません（`npm run check` で確認）。アプリとWebサイトは別のものとして扱います。

## TODO

- 正式版アプリから撮影したスクリーンショットへの差し替え（上の「画像について」）
- 納豆・ヨーグルトなど、情報源が未登録の食品（食品一覧の「Webでは公開準備中の食品」・現在32件）の情報源をアプリ側（`../src/data/referenceSources.ts`）に追加する → 追加すれば自動で公開される
- Search Console への登録と `googleSiteVerification` の設定
