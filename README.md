# AIドライブプラン提案アプリ（Tune Drive）

Next.jsとSupabaseを用いたAIドライブプラン提案アプリです。  
ユーザーが「出発地」「所要時間」「同行者」「テーマ」「音楽ジャンル」などを入力することで、生成AI（OpenAI GPT-4 API）を活用して自動的に最適なドライブプランを提案します。  
さらに、Spotify APIと連携してドライブテーマに合ったプレイリストも自動生成し、音楽と共に楽しめるドライブ体験を提供します。

---

## 🔗 サイトURL

[https://tunedrive.vercel.app/](https://tunedrive.vercel.app/)

※ゲストログインボタンから、メールアドレスとパスワードを入力せずにログインできます。

---

## 🖼 サイトイメージ

![アプリトップ画面](./docs/toppage.png)

---

## ⚙️ 使用技術

- **フロントエンド**：Next.js 15.2（App Router）、React 19、TypeScript  
- **バックエンド**：Next.js API Routes、OpenAI API（GPT-4）、Spotify Web API  
- **データベース**：Supabase（PostgreSQL）  
- **認証**：Supabase Auth（メール・Googleログイン対応）  
- **UI/UX**：Tailwind CSS、Radix UI、Lucide React  
- **地図表示**：Google Maps Embed API  
- **デプロイ**：Vercel  
- **バージョン管理**：Git / GitHub  
- **CI/CD**：GitHub Actions（ESLint対応）  
- **開発補助**：ChatGPT、v0.dev、GitHub Copilot Chat、Cline

---

## 🧭 機能一覧

### 🔐 認証機能
- Supabase Auth による認証システム
- Googleアカウントログイン対応
- ゲストログイン機能（メールアドレス・パスワード不要）

### 🚗 ドライブプラン生成機能
- OpenAI GPT-4 APIを使用したAIドライブプラン自動生成
- 出発地、所要時間、同行者、テーマを入力してカスタマイズ
- 詳細なスポット情報（住所、滞在時間、見どころ、予算、駐車場情報）
- Google Maps埋め込みによる各スポットの地図表示
- ドライブのアドバイス（運転のコツ、事前準備、予算、天候、安全情報）

### 🎵 Spotify連携機能
- Spotify Web APIとの連携
- ドライブテーマと音楽ジャンルに基づいたプレイリスト自動生成
- Spotifyプレイリストの埋め込み表示
- プレイリスト楽曲の編集・並び替え機能

### 📱 ユーザー体験
- マイページでのプラン履歴管理
- レスポンシブデザイン（モバイル・タブレット・PC対応）
- Spotifyテーマのダークモードデザイン
- アニメーション効果による滑らかなUI

---

## 🧩 設計ドキュメント

- [要件定義・基本設計・詳細設計（Googleスプレッドシート）](https://docs.google.com/spreadsheets/d/1rRjkyOX7fHdnkOdHlvCphtfN509hnpwBLWM9iHrh3E8/edit?usp=sharing)  
- 詳細設計時のワイヤーフレーム、ER図、ワークフロー図の画像はdocsディレクトリに格納しています。[こちら](./docs)

---

## ✅ テスト・修正の設計及び実施書

- [単体・結合テスト設計書（Googleスプレッドシート）](https://docs.google.com/spreadsheets/d/1FL_NC0Eabr69PRQ41PoCPsLn1sY5AmJXqIJOCVFHXa0/edit?usp=sharing)  

---

## 💡 アプリの改善案

- [改善項目と対応内容一覧（Googleスプレッドシート）](https://docs.google.com/spreadsheets/d/1rRjkyOX7fHdnkOdHlvCphtfN509hnpwBLWM9iHrh3E8/edit?usp=sharing)

---

## 🧪 ESLintの実行結果

GitHub Actionsによる自動Lint検査を導入しています。  
ESLint + Prettier によるコード整形＆品質チェックを実施。

---

## 🤖 活用した生成AIとその用途

- **ChatGPT**：要件定義／画面設計／API設計の支援  
- **v0.dev**：UIモック作成と初期構成の生成  
- **GitHub Copilot Chat**：コーディング時のリファクタリングやバグ解決  

---

## 🛠 リファクタリング規則

- 2ファイル以上で使う、行数が10行以上のUIコンポーネントは `/components` フォルダに移動  
- 2ファイル以上で使う、行数が10行以上の関数は `/lib` フォルダに移動  
- 複数単語の変数名はキャメルケース（例：`isPublished`）  
- API呼び出し処理は hooks か lib に共通化して再利用  
- Supabaseからのデータ取得処理には型定義（Zod）を明記  

---

## 📌 備考

このアプリは未経験からバックエンドエンジニアを目指すためのポートフォリオとして制作しました。  
AIや自動化、実データを使った体験の提供という現場ニーズに寄り添った構成を目指しています。
