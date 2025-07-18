-- 既存のテーブルを削除（必要に応じて）
-- DROP TABLE IF EXISTS public.plans;

-- 拡張されたプランテーブルを作成
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  departure TEXT NOT NULL,
  theme TEXT NOT NULL,
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
COMMENT ON COLUMN public.plans.route IS 'ドライブルートの詳細情報（JSON形式）';
COMMENT ON COLUMN public.plans.tips IS '構造化されたアドバイス情報（JSON形式）';
COMMENT ON COLUMN public.plans.alternative_spots IS '代替スポット情報（JSON形式）';
COMMENT ON COLUMN public.plans.local_specialties IS '地域の特産品リスト（JSON形式）';
COMMENT ON COLUMN public.plans.photo_spots IS '写真撮影スポットリスト（JSON形式）';