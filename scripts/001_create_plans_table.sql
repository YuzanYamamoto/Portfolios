CREATE TABLE public.plans (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
departure TEXT NOT NULL,
theme TEXT NOT NULL,
route JSONB NOT NULL,
tips TEXT NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) を有効にする
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成する (ユーザーが自分のプランのみを読み書きできるようにする)
-- SELECTポリシー: ユーザーは自分のプランのみを読み取れる
CREATE POLICY "Users can view their own plans." ON public.plans
FOR SELECT USING (auth.uid() = user_id);

-- INSERTポリシー: ユーザーは自分のuser_idでプランを挿入できる
CREATE POLICY "Users can insert their own plans." ON public.plans
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATEポリシー: ユーザーは自分のプランのみを更新できる
CREATE POLICY "Users can update their own plans." ON public.plans
FOR UPDATE USING (auth.uid() = user_id);

-- DELETEポリシー: ユーザーは自分のプランのみを削除できる
CREATE POLICY "Users can delete their own plans." ON public.plans
FOR DELETE USING (auth.uid() = user_id);
