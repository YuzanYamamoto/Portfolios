-- プランテーブルに音楽ジャンル情報を追加
ALTER TABLE plans ADD COLUMN music_genre TEXT;

-- 既存のレコードにはNULLが設定される（任意項目のため問題なし）
COMMENT ON COLUMN plans.music_genre IS 'ユーザーが選択した音楽ジャンル（プレイリスト生成用）';
