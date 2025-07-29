-- plansテーブルにspotify_playlist_idカラムを追加
ALTER TABLE plans
ADD COLUMN spotify_playlist_id text;
