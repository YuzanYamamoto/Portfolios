# Database Setup Scripts

このディレクトリには、Supabaseデータベースのセットアップに必要なSQLスクリプトが含まれています。

## 実行順序

以下の順序でスクリプトを実行してください：

### 1. 000_create_users_table.sql
- `public.users`テーブルを作成
- Supabase Authの`auth.users`テーブルと連携
- Spotify認証情報を保存するカラムを含む
- 新規ユーザー登録時の自動レコード作成トリガーを設定

### 2. 001_create_plans_table.sql
- `public.plans`テーブルを作成
- ドライブプラン情報を保存
- Row Level Security (RLS) ポリシーを設定

### 3. 002_add_spotify_token_to_users.sql
- ⚠️ このスクリプトは000で統合済みのため実行不要
- 既存環境でSpotifyカラムを追加する場合のみ使用

### 4. 003_add_spotify_playlist_id_to_plans.sql
- `public.plans`テーブルに`spotify_playlist_id`カラムを追加
- プランとSpotifyプレイリストの関連付けに使用

## Supabaseでの実行方法

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左サイドバーから「SQL Editor」を選択
4. 「New query」をクリック
5. 上記の順序でスクリプトの内容をコピー&ペーストして実行

## 注意事項

- スクリプトは順序通りに実行してください
- 既存のデータがある場合は、バックアップを取ってから実行してください
- RLSポリシーにより、ユーザーは自分のデータのみアクセス可能です
- `uuid-ossp`拡張が有効になっていることを確認してください

## トラブルシューティング

### エラー: relation "public.users" does not exist
→ 000_create_users_table.sqlを先に実行してください

### エラー: relation "public.plans" does not exist  
→ 001_create_plans_table.sqlを先に実行してください

### エラー: function uuid_generate_v4() does not exist
→ Supabaseで以下を実行してください：
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
