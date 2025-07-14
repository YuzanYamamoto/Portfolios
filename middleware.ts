import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
// import type { CookieOptions } from "next/dist/server/web/types" // この行を削除

export async function middleware(request: NextRequest) {
  // レスポンスオブジェクトを初期化
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // options の型を any に一時的に変更
          // レスポンスヘッダーにクッキーを設定
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          // options の型を any に一時的に変更
          // レスポンスヘッダーからクッキーを削除
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // セッションをリフレッシュし、認証状態を更新します
  // これにより、Server Componentsで最新の認証状態が利用可能になります
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any other files in the public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
