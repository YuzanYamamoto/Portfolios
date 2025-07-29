-- このファイルは000_create_users_table.sqlに統合されました
-- Spotify関連のカラムは既にusersテーブル作成時に含まれています

-- 既存のusersテーブルにSpotifyカラムを追加する場合（テーブルが既に存在する場合）
-- ALTER TABLE public.users
-- ADD COLUMN IF NOT EXISTS spotify_access_token TEXT,
-- ADD COLUMN IF NOT EXISTS spotify_refresh_token TEXT,
-- ADD COLUMN IF NOT EXISTS spotify_token_expires_at BIGINT;

-- 注意: 000_create_users_table.sqlを先に実行してください
