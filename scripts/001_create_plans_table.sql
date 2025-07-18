-- 既存のテーブルを削除（必要に応じて - 開発環境でスキーマをリセットする際に便利です）
-- DROP TABLE IF EXISTS public.plans CASCADE; -- CASCADE を追加すると、関連するトリガーやポリシーも削除されます

-- uuid-ossp 拡張が有効になっていることを確認してください
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 拡張されたプランテーブルを作成
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  departure TEXT NOT NULL,
  theme TEXT NOT NULL,
  -- route カラムは JSONB 型のままですが、内部には images のみを含むことを想定します (各スポットのspotify_playlist_urlは削除済み)
  route JSONB NOT NULL,
  total_duration TEXT,
  total_distance TEXT,
  best_season TEXT,
  difficulty_level TEXT,
  recommended_start_time TEXT,
  tips JSONB NOT NULL, -- 構造化されたtipsオブジェクト
  alternative_spots JSONB,
  local_specialties JSONB,
  photo_spots JSONB,
  -- 🚨 追加: プラン全体のSpotifyプレイリスト情報を格納するカラム
  overall_spotify_playlist JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新時刻を自動更新する関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時刻を自動更新するトリガーを作成
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON public.plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックスを作成（パフォーマンス向上のため）
CREATE INDEX idx_plans_user_id ON public.plans(user_id);
CREATE INDEX idx_plans_created_at ON public.plans(created_at);
CREATE INDEX idx_plans_theme ON public.plans(theme);
CREATE INDEX idx_plans_departure ON public.plans(departure);

-- RLS (Row Level Security) を有効にする
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成する (ユーザーが自分のプランのみを読み書きできるようにする)
-- SELECTポリシー: ユーザーは自分のプランのみを読み取れる
CREATE POLICY "Users can view their own plans." 
ON public.plans FOR SELECT 
USING (auth.uid() = user_id);

-- INSERTポリシー: ユーザーは自分のuser_idでプランを挿入できる
CREATE POLICY "Users can insert their own plans." 
ON public.plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATEポリシー: ユーザーは自分のプランのみを更新できる
CREATE POLICY "Users can update their own plans." 
ON public.plans FOR UPDATE 
USING (auth.uid() = user_id);

-- DELETEポリシー: ユーザーは自分のプランのみを削除できる
CREATE POLICY "Users can delete their own plans." 
ON public.plans FOR DELETE 
USING (auth.uid() = user_id);

-- コメントを追加（データベースの文書化）
COMMENT ON TABLE public.plans IS 'ユーザーが作成したドライブプランを保存するテーブル';
-- route カラムのコメントを更新し、新しい内部構造を反映
COMMENT ON COLUMN public.plans.route IS 'ドライブルートの詳細情報（JSON形式）。各スポットには、名前、説明、滞在時間、画像URLの配列（images）などが含まれることを想定。各スポットごとのSpotifyプレイリストURLは含まれません。';
COMMENT ON COLUMN public.plans.tips IS '構造化されたアドバイス情報（JSON形式）';
COMMENT ON COLUMN public.plans.alternative_spots IS '代替スポット情報（JSON形式）';
COMMENT ON COLUMN public.plans.local_specialties IS '地域の特産品リスト（JSON形式）';
COMMENT ON COLUMN public.plans.photo_spots IS '写真撮影スポットリスト（JSON形式）';
-- 🚨 追加: overall_spotify_playlist カラムのコメント
COMMENT ON COLUMN public.plans.overall_spotify_playlist IS 'プラン全体のSpotifyプレイリスト情報（JSON形式）。タイトル、説明、埋め込みURLなどを含む。';