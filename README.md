# YouTube Shorts 変換ツール

YouTube用の横動画（16:9）を簡単にShorts用の縦動画（9:16）に変換できるWebアプリケーションです。

## 主要機能

- **かんたん変換**: 横動画を縦動画に自動変換
- **タイトル追加**: 動画にタイトルテキストをオーバーレイ
- **サムネイル挿入**: 9:16の画像をイントロとして追加
- **ブラウザ完結**: FFmpeg.wasmを使用してクライアントサイドで処理
- **リアルタイムプレビュー**: 変換後の動画をその場で確認
- **進捗表示**: 変換の進捗状況をリアルタイムで表示

## 技術スタック

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** - UIコンポーネント
- **FFmpeg.wasm** - ブラウザ上での動画変換
- **Zod** - バリデーション
- **Conform** - フォーム管理

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

### 3. 本番用ビルド

```bash
npm run build
npm start
```

## 使い方

1. **動画タイトル**を入力
2. **横動画ファイル**（MP4、WebM等）をアップロード
3. **サムネイル画像**（9:16推奨）をアップロード
4. **変換開始**ボタンをクリック
5. 変換完了後、プレビューを確認してダウンロード

## 対応ファイル形式

### 動画ファイル

- MP4, WebM, AVI, MOV など主要な動画形式

### 画像ファイル

- JPEG, PNG, WebP など主要な画像形式

## 制限事項

- 動画ファイル: 最大100MB
- 画像ファイル: 最大10MB
- 出力動画: 最大60秒に制限

## ディレクトリ構造

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # トップページ
├── features/             # 機能別パッケージ
│   └── video-conversion/
│       ├── actions.ts    # Server Actions
│       ├── components/   # コンポーネント
│       ├── repository.ts # FFmpeg処理
│       └── schemas.ts    # バリデーション
├── components/           # 共通UIコンポーネント
│   ├── ui/              # shadcn/ui
│   └── common/          # 独自コンポーネント
├── lib/                 # ユーティリティ
└── core/                # ドメイン層
```

## 開発方針

このプロジェクトはクリーンアーキテクチャとPackage by Featureパターンを採用しています：

- **プレゼンテーション層**: React コンポーネント
- **アプリケーション層**: Next.js Server Actions
- **ドメイン層**: ビジネスロジックと型定義
- **インフラストラクチャ層**: ORMによるデータベース処理

## ライセンス

MIT License

## 貢献

プルリクエストや Issue の作成を歓迎します。

## トラブルシューティング

### FFmpeg.wasmが読み込めない場合

1. ブラウザが SharedArrayBuffer をサポートしているか確認
2. HTTPSでアクセスしているか確認（localhost除く）
3. Cross-Origin ヘッダーが正しく設定されているか確認

### 変換に失敗する場合

1. 入力ファイルが対応形式か確認
2. ファイルサイズが制限内か確認
3. ブラウザのコンソールでエラーメッセージを確認
