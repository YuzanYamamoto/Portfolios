import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuthButton } from "@/components/auth-button"
import { GuestLoginButton } from "@/components/guest-login-button"
import { Car, Sparkles } from "lucide-react"

export default async function IndexPage() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (user) {
    redirect("/plan/create")
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-spotify-dark via-gray-900/20 to-spotify-dark text-white overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-spotify-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
              Tune Drive
            </h1>
          </div>
          <p className="text-xl text-spotify-lightgray leading-relaxed">
            あなたのためのAIドライブプランナー。出発地とテーマを入力するだけで、おすすめのドライブコース、地図、Spotifyプレイリストを自動生成します。
          </p>
          <div className="space-y-4">
            <div className="transform transition-all duration-300 hover:scale-105">
              <AuthButton />
            </div>
            <div className="transform transition-all duration-300 hover:scale-105">
              <GuestLoginButton />
            </div>
          </div>
          <p className="text-sm text-spotify-lightgray opacity-80">
            ✨ ログインすることで、過去のプラン履歴を保存・閲覧できます。
          </p>
        </div>
      </div>
    </main>
  )
}
