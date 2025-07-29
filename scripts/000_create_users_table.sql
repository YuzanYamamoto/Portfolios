-- usersテーブルを作成（Supabase Authと連携）
-- Supabase Authのauth.usersテーブルと連携するpublic.usersテーブルを作成

-- 既存のテーブルを削除（必要に応じて）
-- DROP TABLE IF EXISTS public.users CASCADE;

-- usersテーブルを作成
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Spotify関連のカラム
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  spotify_token_expires_at BIGINT
);

-- 更新時刻を自動更新する関数を作成（既に存在する場合はスキップ）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新時刻を自動更新するトリガーを作成
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックスを作成
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- RLS (Row Level Security) を有効にする
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成する
-- SELECTポリシー: ユーザーは自分の情報のみを読み取れる
CREATE POLICY "Users can view their own profile." 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- INSERTポリシー: ユーザーは自分のプロフィールを作成できる
CREATE POLICY "Users can insert their own profile." 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- UPDATEポリシー: ユーザーは自分の情報のみを更新できる
CREATE POLICY "Users can update their own profile." 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- DELETEポリシー: ユーザーは自分のプロフィールを削除できる
CREATE POLICY "Users can delete their own profile." 
ON public.users FOR DELETE 
USING (auth.uid() = id);

-- 新しいユーザーが登録されたときに自動的にpublic.usersテーブルにレコードを作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルに新しいユーザーが追加されたときにトリガーを実行
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- コメントを追加
COMMENT ON TABLE public.users IS 'ユーザープロフィール情報とSpotify連携情報を保存するテーブル';
COMMENT ON COLUMN public.users.spotify_access_token IS 'Spotifyのアクセストークン';
COMMENT ON COLUMN public.users.spotify_refresh_token IS 'Spotifyのリフレッシュトークン';
COMMENT ON COLUMN public.users.spotify_token_expires_at IS 'Spotifyトークンの有効期限（UNIXタイムスタンプ）';
