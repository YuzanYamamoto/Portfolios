import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"

export const createClient = cache(async () => {
  const cookieStore = await cookies()

  // デバッグ用: クッキーが正しく取得されているか確認
  const authToken = cookieStore.get("sb-jmlbksejoprxlgsbtugo-auth-token")?.value
  console.log("Server Client - Auth Token from cookieStore:", authToken ? "取得済み" : "未取得")

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        const value = cookieStore.get(name)?.value
        // デバッグ用: 個々のクッキー取得を確認
        // console.log(`Server Client - get('${name}'):`, value ? "取得済み" : "未取得")
        return value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error setting cookie in server client:", error.message)
          } else {
            console.error("Unknown error setting cookie in server client:", error)
          }
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error removing cookie in server client:", error.message)
          } else {
            console.error("Unknown error removing cookie in server client:", error)
          }
        }
      },
    },
  })
})
