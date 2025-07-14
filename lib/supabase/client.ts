import { createBrowserClient } from "@supabase/ssr"

// Supabaseクライアントインスタンスをモジュールのトップレベルで一度だけ作成し、直接エクスポートします。
// これにより、このモジュールがインポートされる際に一度だけ初期化され、
// 常に同じインスタンスが再利用されることが保証されます。
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
