-- ユーザーごとにSpotifyのアクセストークンとリフレッシュトークンを保存するカラムを追加
ALTER TABLE users
ADD COLUMN spotify_access_token text,
ADD COLUMN spotify_refresh_token text,
ADD COLUMN spotify_token_expires_at bigint;
