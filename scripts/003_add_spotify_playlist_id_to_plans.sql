-- plansテーブルにspotify_playlist_idカラムを追加
-- 注意: 001_create_plans_table.sqlを先に実行してください

ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS spotify_playlist_id TEXT;

-- インデックスを追加（検索パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_plans_spotify_playlist_id ON public.plans(spotify_playlist_id);

-- コメントを追加
COMMENT ON COLUMN public.plans.spotify_playlist_id IS 'このプランに関連付けられたSpotifyプレイリストのID';
